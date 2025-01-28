import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { Button, Table, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from 'src/context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle, FaCircle, FaCog, FaBan, FaUpload, FaTimes } from 'react-icons/fa';
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
  const [statusFilter, setStatusFilter] = useState("");
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
        const savedProgram = JSON.parse(sessionStorage.getItem('selectedProgramforverificationstatus'));
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
    sessionStorage.setItem('selectedProgramforverificationstatus', JSON.stringify(selectedOption));
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
          statusFilter: statusFilter,
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
  }, [searchTerm, entriesPerPage, currentPage, statusFilter]);


  useEffect(() => {
    if (selectedProgram) {
      fetchStatuses()
    }
  }, [selectedProgram])


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectEntries = (event) => {
    setEntriesPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
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

  const getStatusForSeries = (pdfs, seriesName) => {
    const pdf = pdfs?.find(pdf => pdf.fileName.includes(`_${seriesName}.pdf`));
    if (pdf) {
      const verifiedAt = new Date(pdf.verifiedAt);
      const formattedVerifiedAt = `${verifiedAt.toLocaleDateString()} ${verifiedAt.toLocaleTimeString()}`;
      const processedStatus = pdf.processed ? "Processed" : "Not Processed";
      const processedIcon = pdf.processed ? <FaCog color="blue" title="Processed" /> : <FaBan color="gray" title="Not Processed" />;
      switch (pdf.status) {
        case 1:
          return <span><FaCog color="blue" title="Processed" /> <FaCheckCircle color="green" title={`Verified - ${pdf.verifiedBy} ${formattedVerifiedAt} - ${processedStatus}`} /></span>;
        case 0:
          return <span><FaCog color="blue" title="Processed" /> <FaCircle color="gray" title={`Not verified - ${processedStatus}`} /></span>; // Assuming a gray circle for not verified
        case 2:
          return <span><FaCog color="blue" title="Processed" /> <FaTimesCircle color="red" title={`Incorrect - ${pdf.verifiedBy} ${formattedVerifiedAt} - ${processedStatus}`} /></span>;
        default:
          return <span><FaCog color="blue" title="Processed" /> <FaQuestionCircle color="gray" title={`Unknown status - ${processedStatus}`} /></span>; // Fallback to question mark if status is unknown
      }
    } else {
      return <FaQuestionCircle color="gray" title="No Status" />;
    }
  };

  const getUploadStatus = (pdfs) => {
    return pdfs.length > 0 ? (
      <FaUpload color="green" title="Uploaded" />
    ) : (
      <FaTimes color="red" title="Not Uploaded" />
    );
  };

  const getStatusForSeriesWithUploadCheck = (pdfs, seriesName) => {
    if (pdfs.length === 0) {
      return <span className='fw-bold '>-</span>;
    }
    return getStatusForSeries(pdfs, seriesName);
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
            {/* <Form.Group controlId="formShowButton">
              <Button
                variant="primary"
                onClick={handleShowStatus}
                disabled={loading || !selectedProgram}
                className="mt-4"
              >
                Show
              </Button>
            </Form.Group> */}
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
            <AllPdfStatusExcel programId={selectedProgram?.value} />
          </Col>
        </Row>

        <div className='border border p-3 rounded'>
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

            <div className="d-flex">
              <div className="status-filter me-3">
                <p>
                  Filter by status{' '}
                  <Form.Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    className="d-inline-block w-auto"
                  >
                    <option value="">All</option>
                    <option value="1">Verified</option>
                    <option value="0">Not Verified</option>
                    <option value="2">Incorrect</option>
                  </Form.Select>
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

          </div>

          <Table striped bordered hover responsive className=''>
            <thead className="text-center">
              <tr>
                <th>Catch Number</th>
                <th>Upload Status</th>
                <th>Status Series of A</th>
                <th>Status Series of B</th>
                <th>Status Series of C</th>
                <th>Status Series of D</th>
              </tr>
            </thead>
            <tbody>
              {pdfStatuses.length > 0 ? (
                pdfStatuses.map((item) => (
                  <tr key={item.catchNumber}>
                    <td className="text-center">{item.catchNumber}</td>
                    <td className="text-center">{getUploadStatus(item.pdfs)}</td>
                    <td className="text-center">{getStatusForSeriesWithUploadCheck(item.pdfs, 'A')}</td>
                    <td className="text-center">{getStatusForSeriesWithUploadCheck(item.pdfs, 'B')}</td>
                    <td className="text-center">{getStatusForSeriesWithUploadCheck(item.pdfs, 'C')}</td>
                    <td className="text-center">{getStatusForSeriesWithUploadCheck(item.pdfs, 'D')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">No Data found</td>
                </tr>
              )}
            </tbody>
          </Table>
          <Row>
            <Col md={6}>
              <div className="pagination-info">
                Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount} entries
              </div>
            </Col>
            {totalPages > 1 && (
              <Col md={6}>
                <div className="pagination justify-content-end">
                  <Pagination>{renderPageNumbers()}</Pagination>
                </div>
              </Col>
            )}
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default VerificationStatus;
