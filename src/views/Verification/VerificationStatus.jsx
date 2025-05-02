import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { Table, Form, Row, Col, Pagination, Badge, Dropdown, Button, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import { useUser } from 'src/context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import {
  FaSort, FaSortUp, FaSortDown, FaCheck, FaTimes,
  FaCircle, FaCog, FaFileUpload, FaFilter,
  FaQuestion, FaSpinner
} from 'react-icons/fa';
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
  const [processedFilter, setProcessedFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
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
  const { pdfStatusCounts, refetch } = useStatusCounts(selectedProgram?.value);
  const { notVerifiedCount = 0, totalCatchNumbers = 0, totalPapers = 0, verifiedCount = 0, wrongCount = 0 } = pdfStatusCounts || {};

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
          setSelectedProgram(programOptions.find(p => p.value === savedProgram.value) || null);
        }
      } catch (error) {
        console.error('Error fetching programmes:', error);
        toast.error('Failed to load programs');
      }
    }

    fetchPrograms();
  }, [keygenUser]);

  useEffect(() => {
    if (selectedProgram) {
      sessionStorage.setItem('selectedProgramme', JSON.stringify(selectedProgram));
      refetch();
    }
  }, [selectedProgram, refetch]);

  const handleProgramChange = (selectedOption) => {
    setSelectedProgram(selectedOption);
    setCurrentPage(1);
    setPdfStatuses([]);
  };

  const handleUploadFilterChange = (value) => {
    console.log('Upload filter changed to:', value);
    setUploadFilter(value);
    setCurrentPage(1);
  };

  const handleProcessedFilterChange = (value) => {
    console.log('Processed filter changed to:', value);
    setProcessedFilter(value);
    setCurrentPage(1);
  };

  const handleVerificationFilterChange = (value) => {
    console.log('Verification filter changed to:', value);
    setVerificationFilter(value);
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
      return;
    }

    setLoading(true);

    try {
      // Prepare filter parameters
      const params = {
        programId: selectedProgram.value,
        pageNumber: currentPage,
        pageSize: entriesPerPage,
        sortField,
        sortOrder,
        searchQuery: searchTerm,
        uploadFilter: uploadFilter
      };

      // Only add processed filter if it's not 'all'
      if (processedFilter !== 'all') {
        // Convert string 'true'/'false' to actual boolean for the API
        params.processedFilter = processedFilter;
      }

      // Only add verification filter if it's not 'all'
      if (verificationFilter !== 'all') {
        params.verificationFilter = verificationFilter;
      }

      console.log('Fetching with params:', params);

      const response = await axios.get(`${apiUrl}/PDFfile/GetPdfsWithPagination`, {
        params,
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });

      const { data, totalCount, totalPages } = response.data;
      setPdfStatuses(data || []);
      setTotalCount(totalCount || 0);
      setTotalPages(totalPages || 0);
    } catch (error) {
      console.error('Error fetching PDF statuses:', error);
      toast.error('Error fetching data. Please try again.');
      setPdfStatuses([]);
      setTotalCount(0);
      setTotalPages(0);
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
  }, [searchTerm, entriesPerPage, currentPage, selectedProgram, uploadFilter, processedFilter, verificationFilter, sortField, sortOrder]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSelectEntries = (event) => {
    setEntriesPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
      startPage = Math.max(1, endPage - totalPagesToShow + 1);
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



  const getStatusBadge = (pdf) => {
    if (!pdf) return null;

    const verifiedAt = pdf.verifiedAt ? new Date(pdf.verifiedAt) : null;
    const formattedVerifiedAt = verifiedAt ?
      `${verifiedAt.toLocaleDateString()} ${verifiedAt.toLocaleTimeString()}` :
      'Not verified';

    // Status icon and color based on verification status
    let statusIcon, statusColor, statusTitle;
    switch (pdf.status) {
      case 1:
        statusIcon = <FaCheck />;
        statusColor = "success";
        statusTitle = `Verified by ${pdf.verifiedByName} on ${formattedVerifiedAt}`;
        break;
      case 2:
        statusIcon = <FaTimes />;
        statusColor = "danger";
        statusTitle = `Marked as incorrect by ${pdf.verifiedByName} on ${formattedVerifiedAt}`;
        break;
      default:
        statusIcon = <FaCircle />;
        statusColor = "secondary";
        statusTitle = "Not verified yet";
        break;
    }

    // Processing icon and color
    const processIcon = pdf.processed ? <FaCog /> : <FaSpinner />;
    const processColor = pdf.processed ? "success" : "danger";
    const processTitle = pdf.processed ? "Processed" : "Not processed";

    // Upload status
    const uploadIcon = <FaFileUpload />;
    const uploadTitle = "Uploaded successfully";

    return (
      <div className="compact-status uploaded-status" title={`Step 1: ${uploadTitle} | Step 2: ${processTitle} | Step 3: ${statusTitle} | ${pdf.fileName}`}>
        <div className="d-flex align-items-center justify-content-center">
          <Badge bg="success" className="me-1 px-1 upload-badge" style={{fontSize: '0.7rem'}}>{uploadIcon}</Badge>
          <Badge bg={processColor} className="me-1 px-1 process-badge" style={{fontSize: '0.7rem'}}>{processIcon}</Badge>
          <Badge bg={statusColor} className="px-1 verify-badge" style={{fontSize: '0.7rem'}}>{statusIcon}</Badge>
          <small className="ms-1 text-muted">{pdf.seriesName}</small>
        </div>
      </div>
    );
  };

  const getStatusForSeries = (pdfs, seriesName) => {
    // If no PDFs at all or no PDF for this series
    if (!pdfs || !pdfs.find(pdf => pdf.seriesName === seriesName)) {
      return (
        <div className="compact-status" title={`Step 1: Not uploaded | Step 2: Cannot process | Step 3: Cannot verify | Series ${seriesName}`}>
          <div className="d-flex align-items-center justify-content-center">
            <Badge bg="danger" className="me-1 px-1 upload-badge" style={{fontSize: '0.7rem'}}><FaTimes /></Badge>
            <Badge bg="danger" className="me-1 px-1 process-badge" style={{fontSize: '0.7rem'}}><FaQuestion /></Badge>
            <Badge bg="secondary" className="px-1 verify-badge" style={{fontSize: '0.7rem'}}><FaQuestion /></Badge>
            <small className="ms-1 text-muted">{seriesName}</small>
          </div>
        </div>
      );
    }

    // If PDF exists for this series
    const pdf = pdfs.find(pdf => pdf.seriesName === seriesName);
    return getStatusBadge(pdf);
  };

  // Add custom CSS for compact table layout

  return (
    <div>
      <style>
        {`
          .compact-status {
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 2px;
            border-radius: 4px;
          }
          .compact-status:hover {
            background-color: rgba(0,0,0,0.05);
            transform: scale(1.05);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .compact-table {
            font-size: 0.85rem;
          }
          .compact-table td {
            padding: 0.3rem 0.4rem !important;
            vertical-align: middle;
          }
          .compact-table th {
            padding: 0.4rem !important;
            font-size: 0.9rem;
          }
          .badge {
            font-weight: normal;
          }
          .upload-badge, .process-badge, .verify-badge {
            border: 1px solid rgba(0,0,0,0.1);
          }
          .uploaded-status .upload-badge {
            background-color: #28a745 !important;
          }
          .process-badge.bg-success {
            background-color: #28a745 !important;
          }
          .process-badge.bg-danger {
            background-color: #dc3545 !important;
          }
          .verify-badge.bg-success {
            background-color: #28a745 !important;
          }
          .verify-badge.bg-secondary {
            background-color: #6c757d !important;
          }
          .verify-badge.bg-danger {
            background-color: #dc3545 !important;
          }
          .table-striped>tbody>tr:nth-of-type(odd)>* {
            background-color: rgba(0,0,0,0.02);
          }
          .filter-icon {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .filter-icon:hover {
            color: #0d6efd;
          }
          .dropdown-toggle::after {
            display: none;
          }
          .dropdown-menu {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
        `}
      </style>
      <ToastContainer />
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="formProgram">
              <Form.Label>Select Program</Form.Label>
              <Select
                options={programs}
                value={selectedProgram}
                onChange={handleProgramChange}
                isSearchable
                placeholder="Select a program..."
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <div className="status-summary mb-3 mt-4">
              <div>
                <Badge bg="secondary" className='p-2'>Total Catches: {totalPapers || 0}</Badge>
                <Badge bg="info" className="p-2 ms-2">Not Uploaded: {(totalPapers - totalCatchNumbers) || 0}</Badge>
                <Badge bg="primary" className="p-2 ms-2">Uploaded: {totalCatchNumbers || 0}</Badge>
                <Badge bg="warning" className="p-2 ms-2">Not Verified: {notVerifiedCount || 0}</Badge>
                <Badge bg="success" className="p-2 ms-2">Verified: {verifiedCount || 0}</Badge>
                <Badge bg="danger" className="p-2 ms-2">Incorrect: {wrongCount || 0}</Badge>
              </div>
            </div>
          </Col>
          <Col md={1} className='text-end mt-4'>
            {selectedProgram && <AllPdfStatusExcel programId={selectedProgram?.value} />}
          </Col>

          {/* Status Legend */}
          <Col md={12} className="mt-2 mb-2">
            <div className="d-flex align-items-center justify-content-end" style={{fontSize: '0.8rem'}}>
              <span className="me-3">Legend:</span>
              <span className="me-3" title="Upload Status">
                <Badge bg="success" className="me-1 px-1 upload-badge" style={{fontSize: '0.7rem'}}><FaFileUpload /></Badge> Uploaded
              </span>
              <span className="me-3" title="Upload Status">
                <Badge bg="danger" className="me-1 px-1" style={{fontSize: '0.7rem'}}><FaTimes /></Badge> Not Uploaded
              </span>
              <span className="me-3" title="Processing Status">
                <Badge bg="success" className="me-1 px-1" style={{fontSize: '0.7rem'}}><FaCog /></Badge> Processed
              </span>
              <span className="me-3" title="Processing Status">
                <Badge bg="danger" className="me-1 px-1" style={{fontSize: '0.7rem'}}><FaSpinner /></Badge> Not Processed
              </span>
              <span className="me-3" title="Verification Status">
                <Badge bg="success" className="me-1 px-1 verify-badge" style={{fontSize: '0.7rem'}}><FaCheck /></Badge> Verified
              </span>
              <span className="me-3" title="Verification Status">
                <Badge bg="secondary" className="me-1 px-1 verify-badge" style={{fontSize: '0.7rem'}}><FaCircle /></Badge> Not Verified
              </span>
              <span title="Verification Status">
                <Badge bg="danger" className="me-1 px-1 verify-badge" style={{fontSize: '0.7rem'}}><FaTimes /></Badge> Incorrect
              </span>
            </div>
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
            <div className="search-and-filter">
              <Form.Group className="mb-2 d-flex align-items-center gap-2">
                <Form.Label className='mt-1'>Search:</Form.Label>
                <Form.Control
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by catch number"
                />
                <Dropdown>
                  <Dropdown.Toggle
                    variant={uploadFilter !== 'all' || processedFilter !== 'all' || verificationFilter !== 'all' ? "primary" : "outline-secondary"}
                    size="sm"
                    id="filter-dropdown"
                    className="px-2 py-1"
                    title="Filter options"
                  >
                    <FaFilter className="me-1" /> Filters
                    {(uploadFilter !== 'all' || processedFilter !== 'all' || verificationFilter !== 'all') &&
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.5rem'}}>
                        {(uploadFilter !== 'all' ? 1 : 0) + (processedFilter !== 'all' ? 1 : 0) + (verificationFilter !== 'all' ? 1 : 0)}
                      </span>
                    }
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end" className="p-2" style={{ minWidth: '250px' }}>
                    <h6 className="dropdown-header">Filter Options</h6>

                    <div className="mb-2">
                      <Form.Label className="mb-1">Upload Status</Form.Label>
                      <Form.Select
                        size="sm"
                        value={uploadFilter}
                        onChange={(e) => handleUploadFilterChange(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="uploaded">Fully Uploaded</option>
                        <option value="notUploaded">Partially/Not Uploaded</option>
                      </Form.Select>
                    </div>

                    <div className="mb-2">
                      <Form.Label className="mb-1">Processing Status</Form.Label>
                      <Form.Select
                        size="sm"
                        value={processedFilter}
                        onChange={(e) => handleProcessedFilterChange(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="true">Processed</option>
                        <option value="false">Not Processed</option>
                      </Form.Select>
                    </div>

                    <div className="mb-3">
                      <Form.Label className="mb-1">Verification Status</Form.Label>
                      <Form.Select
                        size="sm"
                        value={verificationFilter}
                        onChange={(e) => handleVerificationFilterChange(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="1">Verified</option>
                        <option value="0">Not Verified</option>
                        <option value="2">Incorrect</option>
                      </Form.Select>
                    </div>

                    <div className="d-grid">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          handleUploadFilterChange('all');
                          handleProcessedFilterChange('all');
                          handleVerificationFilterChange('all');
                        }}
                        disabled={uploadFilter === 'all' && processedFilter === 'all' && verificationFilter === 'all'}
                      >
                        Reset All Filters
                      </Button>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
            </div>
          </div>

          {/* Get unique series names from the data */}
          {(() => {
            // Extract all unique series names from the data
            const allSeries = new Set();
            pdfStatuses.forEach(item => {
              if (item.pdfs) {
                item.pdfs.forEach(pdf => {
                  if (pdf.seriesName) {
                    allSeries.add(pdf.seriesName);
                  }
                });
              }
            });

            // Use the series from the data or provide defaults for both ABCD and PQRS conventions
            let seriesNames = [];
            if (allSeries.size > 0) {
              seriesNames = Array.from(allSeries).sort();
            } else {
              // Check if any of the common series naming conventions are present in the data
              const hasPQRS = pdfStatuses.some(item =>
                item.pdfs && item.pdfs.some(pdf => ['P', 'Q', 'R', 'S'].includes(pdf.seriesName))
              );
              const hasABCD = pdfStatuses.some(item =>
                item.pdfs && item.pdfs.some(pdf => ['A', 'B', 'C', 'D'].includes(pdf.seriesName))
              );

              // Use the detected convention or default to PQRS
              seriesNames = hasPQRS ? ['P', 'Q', 'R', 'S'] :
                           hasABCD ? ['A', 'B', 'C', 'D'] :
                           ['P', 'Q', 'R', 'S'];
            }

            return (
              <Table striped bordered hover responsive size="sm" className="compact-table">
                <thead className="text-center">
                  <tr>
                    <th style={{cursor: 'pointer', width: '20%'}} onClick={() => handleSort('catchNumber')}>
                      Catch # {getSortIcon('catchNumber')}
                    </th>
                    {seriesNames.map(series => (
                      <th key={series} style={{width: `${80 / seriesNames.length}%`}}>
                        {series}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(entriesPerPage).fill(0).map((_, index) => (
                      <tr key={index}>
                        <td><Skeleton baseColor="#D3D3D3" highlightColor="#E8E8E8" height={24} /></td>
                        {seriesNames.map(series => (
                          <td key={series}><Skeleton baseColor="#D3D3D3" highlightColor="#E8E8E8" height={24} /></td>
                        ))}
                      </tr>
                    ))
                  ) : !selectedProgram ? (
                    <tr>
                      <td colSpan={seriesNames.length + 1} className="text-center">Please select a program</td>
                    </tr>
                  ) : pdfStatuses.length > 0 ? (
                    pdfStatuses.map((item) => (
                      <tr key={item.catchNumber}>
                        <td className="text-center fw-bold">{item.catchNumber}</td>
                        {seriesNames.map(series => (
                          <td key={series} className="text-center">
                            {getStatusForSeries(item.pdfs, series)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={seriesNames.length + 1} className="text-center">No data found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            );
          })()}


          {pdfStatuses.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <p>Showing {((currentPage - 1) * entriesPerPage) + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount}</p>
              {totalPages > 1 && (
                <nav aria-label="Page navigation">
                  <Pagination>{renderPageNumbers()}</Pagination>
                </nav>
              )}
            </div>
          )}
        </div>
      </Form>
    </div>
  );
};

export default VerificationStatus;
