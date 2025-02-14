import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Button, Table, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from 'src/context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaCircle, FaCog, FaUpload, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import AllPdfStatusExcel from './components/AllPdfStatusExcel';
import useStatusCounts from 'src/context/usePdfStatusData';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const apiUrl = process.env.REACT_APP_BASE_API_URL;

const VerificationStatus = () => {
  const { keygenUser } = useUser();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [pdfStatuses, setPdfStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadFilter, setUploadFilter] = useState('all');
  const [sortField, setSortField] = useState('catchNumber');
  const [sortOrder, setSortOrder] = useState('asc');
  const [entriesPerPage, setEntriesPerPage] = useState(() => {
    const saved = localStorage.getItem('verificationEntriesPerPage');
    return saved ? parseInt(saved) : 10;
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('verificationCurrentPage');
    return saved ? parseInt(saved) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { pdfStatusCounts, loadingstatus, error, refetch } = useStatusCounts(selectedProgram?.value);
  const { notVerifiedCount = 0, totalCatchNumbers = 0, totalFiles = 0, totalPapers = 0, verifiedCount = 0, wrongCount = 0 } = pdfStatusCounts || {};

  useEffect(() => {
    localStorage.setItem('verificationCurrentPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('verificationEntriesPerPage', entriesPerPage.toString());
  }, [entriesPerPage]);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await axios.get(`${apiUrl}/Programmes`, {
          headers: { Authorization: `Bearer ${keygenUser?.token}` },
        });
        const programOptions = response.data.map((program) => ({
          value: program.programmeID,
          label: program.programmeName,
        }));
        setPrograms(programOptions);

        const savedProgram = JSON.parse(sessionStorage.getItem('selectedProgramme'));
        if (savedProgram) {
          setSelectedProgram(programOptions.find(p => p.value === savedProgram.value));
        }
      } catch (error) {
        console.error('Error fetching programmes:', error);
      }
    }

    fetchPrograms();
  }, [keygenUser]);

  useEffect(() => {
    if (selectedProgram) {
      refetch();
    }
  }, [selectedProgram, refetch]);

  const handleProgramChange = (selectedOption) => {
    setSelectedProgram(selectedOption);
    setCurrentPage(1);
    setPdfStatuses([]);
  };

  const handleUploadFilterChange = (event) => {
    setUploadFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (field !== sortField) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const fetchStatuses = async () => {
    if (!selectedProgram) {
      toast.error('Please select a program first.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${apiUrl}/PDFfile/GetPdfsWithPagination`, {
        params: {
          programId: selectedProgram.value,
          pageNumber: currentPage,
          pageSize: entriesPerPage,
          sortField,
          sortOrder,
          searchQuery: searchTerm,
          uploadFilter: uploadFilter,
          maxPdfsPerCatchNumber: 4,
        },
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });

      const { data, totalCount, totalPages } = response.data;
      setPdfStatuses(data);
      setTotalCount(totalCount);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching PDF statuses:', error);
      toast.error('Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId;
    
    if (selectedProgram) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchStatuses, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [searchTerm, entriesPerPage, currentPage, selectedProgram, uploadFilter, sortField, sortOrder]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectEntries = (event) => {
    setEntriesPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
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

    if (startPage > 1) {
      pages.push(
        <Pagination.First
          key="first"
          onClick={() => handlePageChange(1)}
        />
      );
    }

    if (currentPage > 1) {
      pages.push(
        <Pagination.Prev
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
        />
      );
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <Pagination.Next
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
        />
      );
    }

    if (endPage < totalPages) {
      pages.push(
        <Pagination.Last
          key="last"
          onClick={() => handlePageChange(totalPages)}
        />
      );
    }

    return pages;
  };

  const getStatusForSeries = (pdfs, seriesName) => {
    if (!pdfs) {
      return (
        <span>
          <FaUpload className="ms-1" color="red" title="Not Uploaded" /> {' '}
          <FaCog className="ms-1" color="gray" title="Not Processed" /> {' '}
          <FaQuestionCircle color="gray" title="No Status" />
        </span>
      );
    }

    const pdf = pdfs.find(pdf => pdf.seriesName === seriesName);
    if (pdf) {
      const verifiedAt = new Date(pdf.verifiedAt);
      const formattedVerifiedAt = `${verifiedAt.toLocaleDateString()} ${verifiedAt.toLocaleTimeString()}`;
      const statusIcon = (() => {
        switch (pdf.status) {
          case 1:
            return <FaCheckCircle color="green" title={`Verified - ${pdf.verifiedByName} ${formattedVerifiedAt}`} />;
          case 0:
            return <FaCircle color="gray" title="Not verified" />;
          case 2:
            return <FaTimesCircle color="red" title={`Incorrect - ${pdf.verifiedByName} ${formattedVerifiedAt}`} />;
          default:
            return <FaQuestionCircle color="gray" />;
        }
      })();
      
      return (
        <span>
          <FaUpload className="ms-1" color="green" title="Uploaded" /> {' '}
          {pdf.processed && <><FaCog className="ms-1" color="green" title="Processed" /> {' '}</>}
          {statusIcon}
        </span>
      );
    } else {
      return (
        <span>
          <FaUpload className="ms-1" color="red" title="Not Uploaded" /> {' '}
          <FaCog className="ms-1" color="gray" title="Not Processed" /> {' '}
          <FaQuestionCircle color="gray" title="No Status" />
        </span>
      );
    }
  };

  return (
    <div>
      <ToastContainer />
      <Form>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group controlId="formProgram">
              <Form.Label>Select Program</Form.Label>
              <Select
                options={programs}
                value={selectedProgram}
                onChange={handleProgramChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="formUploadFilter">
              <Form.Label>Upload Status</Form.Label>
              <Form.Select value={uploadFilter} onChange={handleUploadFilterChange}>
                <option value="all">All</option>
                <option value="uploaded">Uploaded</option>
                <option value="notUploaded">Not Uploaded</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={5}>
            <div className="status-summary mb-3">
              <div>
              <Badge bg="secondary" className='p-2'>Total Catches: {totalPapers}</Badge>
              <Badge bg="info" className="p-2 ms-2">Not Uploaded: {totalPapers - totalCatchNumbers}</Badge>
              <Badge bg="primary" className="p-2 ms-2">Uploaded: {totalCatchNumbers}</Badge>
              <Badge bg="warning" className="p-2 ms-2">Not Verified: {notVerifiedCount}</Badge>
              <Badge bg="success" className="p-2 ms-2">Verified: {verifiedCount}</Badge>
              <Badge bg="danger" className="p-2 ms-2">Incorrect: {wrongCount}</Badge>
              </div>
            </div>
          </Col>
          <Col md={1} className='text-end'>
            <AllPdfStatusExcel programId={selectedProgram?.value}/>
          </Col>
        </Row>

        <div className='border border p-3 rounded'>
          <div className="filter-controls d-flex justify-content-between">
            <div className="entries-per-page">
              <p className='mb-2 d-flex align-items-center gap-1'>
                Show <span><Form.Select value={entriesPerPage} onChange={handleSelectEntries}>
                  <option value="5">05</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select></span> Entries
              </p>
            </div>
            <div className="search">
              <Form.Group className="mb-2 d-flex align-items-center gap-1">
                <Form.Label className='mt-1'>Search:</Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by catch number"
                />
              </Form.Group>
            </div>
          </div>

          <Table striped bordered hover responsive>
            <thead className="text-center">
              <tr>
                <th style={{cursor: 'pointer'}} onClick={() => handleSort('catchNumber')}>
                  Catch Number {getSortIcon('catchNumber')}
                </th>
                <th>Status of Series A</th>
                <th>Status of Series B</th>
                <th>Status of Series C</th>
                <th>Status of Series D</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(entriesPerPage).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td><Skeleton baseColor="#D3D3D3" highlightColor="#E8E8E8" /></td>
                    <td><Skeleton baseColor="#D3D3D3" highlightColor="#E8E8E8" /></td>
                    <td><Skeleton baseColor="#D3D3D3" highlightColor="#E8E8E8" /></td>
                    <td><Skeleton baseColor="#D3D3D3" highlightColor="#E8E8E8" /></td>
                    <td><Skeleton baseColor="#D3D3D3" highlightColor="#E8E8E8" /></td>
                  </tr>
                ))
              ) : pdfStatuses.length > 0 ? (
                pdfStatuses.map((item) => (
                  <tr key={item.catchNumber}>
                    <td className="text-center">{item.catchNumber}</td>
                    <td className="text-center">{getStatusForSeries(item.pdfs, 'A')}</td>
                    <td className="text-center">{getStatusForSeries(item.pdfs, 'B')}</td>
                    <td className="text-center">{getStatusForSeries(item.pdfs, 'C')}</td>
                    <td className="text-center">{getStatusForSeries(item.pdfs, 'D')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">No Data found</td>
                </tr>
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <p>Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount}</p>
            <nav aria-label="Page navigation">
              <Pagination>{renderPageNumbers()}</Pagination>
            </nav>
          </div>
        </div>        
      </Form>
    </div>
  );
};

export default VerificationStatus;