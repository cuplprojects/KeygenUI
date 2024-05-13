// AllKeys.js
import React, { useEffect, useState } from "react";
import { Container, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUser } from "./../../context/UserContext";
import axios from "axios";
import PaperPlaceholder from "./../../MyPlaceholders/PaperPlaceholder";
import KeysTable from "./KeysTable";

const apiUrl = process.env.REACT_APP_BASE_URL;

const AllKeys = () => {
  const { keygenUser } = useUser();
  const token = keygenUser?.token;
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [dataEntriesToShow, setDataEntriesToShow] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let timeoutId;

    const fetchData = async () => {
      try {
        let url = `${apiUrl}/api/Papers/${currentPage}/${dataEntriesToShow}`;
        if (searchQuery) {
          url = `${apiUrl}/api/Papers/${currentPage}/${dataEntriesToShow}/Search?searchData=${searchQuery}`;
        }
        const papersData = await axios.get(url, {
          params: { keyGenerated: true },
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.data);
        setPapers(papersData.papers);
        setTotalPages(papersData.totalPages);
        setTotalCount(papersData.totalCount)
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setPapers([])
        setLoading(false);
      }
    };

    if (searchQuery) {
      clearTimeout(timeoutId); // Clear any existing timeout
      timeoutId = setTimeout(fetchData, 500); // Set a new timeout
    } else {
      fetchData(); // If no search query, fetch immediately
    }

    return () => clearTimeout(timeoutId); // Cleanup the timeout on unmount or query change
  }, [currentPage, token, dataEntriesToShow, searchQuery]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const totalPagesToShow = 5; // Number of page buttons to show
    const halfTotalPagesToShow = Math.floor(totalPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfTotalPagesToShow);
    let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

    if (totalPagesToShow > totalPages) {
      startPage = 1;
      endPage = totalPages;
    } else if (endPage - startPage < totalPagesToShow - 1) {
      startPage = endPage - totalPagesToShow + 1;
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <button key={page} className={`page-link ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
          {page}
        </button>
      );
    }

    return pages;
  };

  const handleSelectShowEntries = (event) => {
    setDataEntriesToShow(parseInt(event.target.value));
    setCurrentPage(1)
  };


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>All Generated Keys</h3>
        <Link to={`/KeyGenerator/Newkey`} className="btn btn-primary">
          Generate New
        </Link>
      </div>
      <hr />

      {loading ? (
        <div className="text-center">
          <PaperPlaceholder />
        </div>
      ) : (
        <>
          <div className="w-100 d-flex align-items-center justify-content-between">
            <div className="dataonpage">
              <div>
                <p className='mb-2 d-flex align-items-center gap-1'>
                  Show <span> <Form.Select value={dataEntriesToShow} onChange={handleSelectShowEntries}>
                    <option value="5">05</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select></span> Entries
                </p>
              </div>
            </div>
            <div className="search">
              <Form.Group className="mb-2 d-flex align-items-center gap-1" >
                <Form.Label className='mt-1'>Search:</Form.Label>
                <Form.Control type="text" value={searchQuery} onChange={handleSearchChange} />
              </Form.Group>
            </div>
          </div>
          <KeysTable
            papers={papers}
            token={token}
          />
          <div className="d-flex justify-content-between align-items-center mt-3">
            <p>Showing {((currentPage - 1) * dataEntriesToShow) + 1} to {((currentPage - 1) * dataEntriesToShow + papers?.length)} of {totalCount}</p>
            <nav aria-label="Page navigation example">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(1)}>First</button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>&laquo;</button>
                </li>
                {renderPageNumbers()}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>&raquo;</button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(totalPages)}>Last</button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </Container>
  );
};

export default AllKeys;
