// AllKeys.js
import React, { useEffect, useState } from "react";
import { Container, Dropdown, DropdownButton, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUser } from "./../../context/UserContext";
import axios from "axios";
import PaperPlaceholder from "./../../MyPlaceholders/PaperPlaceholder";
import KeysTable from "./KeysTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const apiUrl = process.env.REACT_APP_BASE_URL;

const AllKeys = () => {
  const { keygenUser } = useUser();
  const token = keygenUser?.token;
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('keysCurrentPage');
    return saved ? parseInt(saved) : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const [dataEntriesToShow, setDataEntriesToShow] = useState(() => {
    const saved = localStorage.getItem('keysEntriesPerPage');
    return saved ? parseInt(saved) : 10;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(() => {
    return localStorage.getItem('keysSelectedProgram') || "";
  });
  const [programList, setProgramList] = useState([]);

  useEffect(() => {
    const fetchProgramList = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/Programmes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgramList(response.data);
      } catch (error) {
        console.error("Error fetching program list:", error);
      }
    }
    fetchProgramList();
  }, [token])

  useEffect(() => {
    localStorage.setItem('keysCurrentPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('keysEntriesPerPage', dataEntriesToShow.toString());
  }, [dataEntriesToShow]);

  useEffect(() => {
    localStorage.setItem('keysSelectedProgram', selectedProgram);
  }, [selectedProgram]);

  useEffect(() => {
    let timeoutId;

    const fetchData = async () => {
      try {
          let url = `${apiUrl}/api/Papers/${currentPage}/${dataEntriesToShow}`;
          let params = { keyGenerated: true }; // Define params object
  
          if (searchQuery) {
              url = `${apiUrl}/api/Papers/${currentPage}/${dataEntriesToShow}/Search?searchData=${searchQuery}`;
          }
  
          if (selectedProgram) {
              params.Programid = selectedProgram; // Add selected program to params
          }
  
          const response = await axios.get(url, {
              params, // Pass params object correctly
              headers: { Authorization: `Bearer ${token}` }
          });
  
          const papersData = response.data;
          setPapers(papersData.papers);
          setTotalPages(papersData.totalPages);
          setTotalCount(papersData.totalCount);
          setLoading(false);
      } catch (error) {
          console.error("Error fetching data:", error);
          setPapers([]);
          setLoading(false);
      }
  };
  

    if (searchQuery) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchData, 500);
    } else {
      fetchData();
    }

    return () => clearTimeout(timeoutId);
  }, [currentPage, token, dataEntriesToShow, searchQuery, selectedProgram]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const totalPagesToShow = 5;
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
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleProgramChange = (programId) => {
    setSelectedProgram(programId);
    setCurrentPage(1);
  };

  return (
    <Container fluid className="userform border border-3 p-4 my-3">
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
            <div className="d-flex align-items-center gap-2">
              <div className="filter">
                <Form.Group className="mb-2 d-flex align-items-center gap-1">
                  <Form.Label className='mt-1'>Program:</Form.Label>
                  <DropdownButton 
                    id={`select-program-filter`}
                    size="sm"
                    variant="outline-primary"
                    title={<FontAwesomeIcon icon={faFilter} />}
                    drop="start"
                  >
                    <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                      <p className="text-center bg-primary text-white mx-2 my-1 rounded-pill sticky-top">
                        {selectedProgram ? programList.find(p => p.programmeID === selectedProgram)?.programmeName : "All Programs"}
                      </p>
                      <Dropdown.Item 
                        key="all" 
                        onClick={() => handleProgramChange("")}
                      >
                        All Programs
                      </Dropdown.Item>
                      {programList.map(program => (
                        <Dropdown.Item
                          key={program.programmeID}
                          onClick={() => handleProgramChange(program.programmeID)}
                        >
                          {program.programmeName}
                        </Dropdown.Item>
                      ))}
                    </div>
                  </DropdownButton>
                </Form.Group>
              </div>
              <div className="search">
                <Form.Group className="mb-2 d-flex align-items-center gap-1" >
                  <Form.Label className='mt-1'>Search:</Form.Label>
                  <Form.Control type="text" value={searchQuery} onChange={handleSearchChange} />
                </Form.Group>
              </div>
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
