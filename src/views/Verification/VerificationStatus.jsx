import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { Button, Table, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from 'src/context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaCircle } from 'react-icons/fa';
import AllPdfStatusExcel from './components/AllPdfStatusExcel';
import useStatusCounts from 'src/context/usePdfStatusData';

const apiUrl = process.env.REACT_APP_BASE_API_URL;

const VerificationStatus = () => {
  const { keygenUser } = useUser();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [pdfStatuses, setPdfStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { pdfStatusCounts, loadingstatus, error, refetch } = useStatusCounts(selectedProgram?.value);
  const { notVerifiedCount = 0, totalCatchNumbers = 0, totalFiles = 0, totalPapers = 0, verifiedCount = 0, wrongCount = 0 } = pdfStatusCounts || {};

  // Ref for debounce timeout
  const debounceTimeoutRef = useRef(null);

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

        // Load selected program from sessionStorage
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
    setCurrentPage(1); // Reset to the first page when program changes
    setPdfStatuses([]); // Clear data when program changes
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
          sortField: 'catchNumber',
          sortOrder: 'asc',
          searchQuery: searchTerm,
          maxPdfsPerCatchNumber: 4, // Adjust this if needed
        },
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });

      const { data, totalCount, totalPages } = response.data;
      setPdfStatuses(data);
      setTotalCount(totalCount);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching PDF statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (selectedProgram) {
        fetchStatuses();
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm, entriesPerPage, currentPage]);

  const handleShowStatus = () => {
    fetchStatuses();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectEntries = (event) => {
    setEntriesPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };

  const renderPageNumbers = () => {
    const pages = [];
    const totalPagesToShow = Math.min(totalPages, 5); // Number of page buttons to show
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

  // Count statuses
  const statusCounts = pdfStatuses.reduce((acc, status) => {
    acc.total += 1;
    acc[status.status] = (acc[status.status] || 0) + 1;
    return acc;
  }, { total: 0, 'Not Uploaded': 0, 'Uploaded': 0, 'Verified': 0 });

  const getStatusForSeries = (pdfs, seriesName) => {
    const pdf = pdfs?.pdfs?.find(pdf => pdf.seriesName === seriesName);
    if (pdf) {
      const verifiedAt = new Date(pdf.verifiedAt);
      const formattedVerifiedAt = `${verifiedAt.toLocaleDateString()} ${verifiedAt.toLocaleTimeString()}`;
      switch (pdf.status) {
        case 1:
          return <FaCheckCircle color="green" title={`${pdf.verifiedByName} ${formattedVerifiedAt}`} />;
        case 0:
          return <FaCircle color="gray" title="Not verified" />; // Assuming a gray circle for not verified
        case 2:
          return <FaTimesCircle color="red" title="PDF is invalid" />;
        default:
          return <FaQuestionCircle color="gray" />; // Fallback to question mark if status is unknown
      }
    } else {
      return <FaQuestionCircle color="gray" />;
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
            <Form.Group controlId="formShowButton">
              <Button
                variant="primary"
                onClick={handleShowStatus}
                disabled={loading || !selectedProgram}
                className="mt-4"
              >
                Show
              </Button>
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

        <div className="filter-controls d-flex justify-content-between">
          <div className="entries-per-page">
            <p>
              Show{' '}
              <Form.Select
                value={entriesPerPage}
                onChange={handleSelectEntries}
                className="d-inline-block w-auto"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </Form.Select>{' '}
              entries per page
            </p>
          </div>
          <div className="search">
            <Form.Control
              type="text"
              placeholder="Search by catch number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Table striped bordered hover responsive>
          <thead className="text-center">
            <tr>
              <th>Catch Number</th>
              <th>Status Series of A</th>
              <th>Status Series of B</th>
              <th>Status Series of C</th>
              <th>Status Series of D</th>
            </tr>
          </thead>
          <tbody>
            {pdfStatuses.map((item) => (
              <tr key={item.catchNumber}>
                <td className="text-center">{item.catchNumber}</td>
                <td className="text-center">{getStatusForSeries(item.pdfs, 'A')}</td>
                <td className="text-center">{getStatusForSeries(item.pdfs, 'B')}</td>
                <td className="text-center">{getStatusForSeries(item.pdfs, 'C')}</td>
                <td className="text-center">{getStatusForSeries(item.pdfs, 'D')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
 {totalPages > 1 && (
            <Row>
              <Col md={12}>
                <div className="pagination justify-content-end">
                  <Pagination>{renderPageNumbers()}</Pagination>
                </div>
              </Col>
            </Row>
          )}
        
      </Form>
    </div>
  );
};

export default VerificationStatus;
