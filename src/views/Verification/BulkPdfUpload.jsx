import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import { Col, Row, Form, Button, Table, Pagination, Alert, Badge } from 'react-bootstrap'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faCheckCircle, faTimesCircle, faExclamationTriangle, faFileAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useUser } from 'src/context/UserContext'
import { ToastContainer, toast } from 'react-toastify'
import UploadFailFiles from './components/UploadFailFiles'
import pdfjsLib from './components/pdfWorkerLoader'
import ErrorBoundary from 'src/components/ErrorBoundary'
import { safeStringify } from 'src/utils/errorHandler'
import FileUploadProgress from 'src/components/FileUploadProgress'

const apiUrl = process.env.REACT_APP_BASE_API_URL

const BulkPdfUpload = () => {
  const { keygenUser } = useUser()
  const [programs, setPrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'file', direction: 'asc' })
  const [uploadSuccessCount, setUploadSuccessCount] = useState(0)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await axios.get(`${apiUrl}/Programmes`, {
          headers: { Authorization: `Bearer ${keygenUser?.token}` },
        })
        const data = response.data

        const programOptions = data.map((program) => ({
          value: program.programmeID,
          label: program.programmeName,
        }))
        setPrograms(programOptions)

        const selectedProgrammeFromStorage = sessionStorage.getItem('selectedProgramme')
        if (selectedProgrammeFromStorage) {
          const parsedProgramme = JSON.parse(selectedProgrammeFromStorage)
          setSelectedProgram(parsedProgramme)
        }
      } catch (error) {
        console.error('Error fetching programmes:', error)
      }
    }
    fetchPrograms()
  }, [keygenUser])

  const handleProgramChange = (selectedOption) => {
    setSelectedProgram(selectedOption)
    sessionStorage.setItem('selectedProgramme', JSON.stringify(selectedOption))
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || [])
    const validFiles = []
    const invalidFiles = []

    files.forEach((file) => {
      if (file.type === 'application/pdf') {
        validFiles.push(file)
      } else {
        invalidFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      // Show error message for invalid files
      toast.warning('Only PDF files are allowed. Some files were not added.')
      setUploadStatus((prevStatus) => [
        ...prevStatus,
        ...invalidFiles.map((file) => ({
          file: file.name,
          status: 'Upload failed',
          remark: 'Only PDF files are allowed.',
        })),
      ])
    }

    // Clear the table when new files are selected
    setUploadStatus([])
    setSelectedFiles(validFiles)

    // Show toast with file count
    if (validFiles.length > 0) {
      toast.info(`${validFiles.length} PDF file${validFiles.length > 1 ? 's' : ''} selected and ready for upload.`);
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }

    if (!selectedProgram) {
      toast.error('No program selected');
      return;
    }

    setUploading(true);
    setOverallProgress(0);
    setUploadSuccessCount(0);

    try {
      let completedFiles = 0;
      let totalSuccess = 0;

      // Process each file individually
      for (const file of selectedFiles) {
        try {
          // Extract PDF information
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdfDoc.numPages;

          // Upload the file
          const formData = new FormData();
          formData.append('file', file);
          formData.append('bookletsize', numPages);

          // Send the file to the backend which will handle both saving and processing
          const response = await axios.post(
            `${apiUrl}/PDFfile?ProgramId=${selectedProgram.value}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${keygenUser?.token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          // Increment success count
          totalSuccess++;
          setUploadSuccessCount(prevCount => prevCount + 1);

          // Update status to show successful upload and processing
          // Ensure processingStatus is a string
          let processingStatus = 'File uploaded and sent for processing';

          if (response?.data?.processingStatus) {
            if (typeof response.data.processingStatus === 'string') {
              processingStatus = response.data.processingStatus;
            } else if (typeof response.data.processingStatus === 'object') {
              try {
                processingStatus = JSON.stringify(response.data.processingStatus);
              } catch (e) {
                processingStatus = 'File uploaded and sent for processing';
              }
            }
          }

          setUploadStatus(prevStatus => [
            ...prevStatus,
            {
              file: file.name,
              status: 'Uploaded successfully',
              remark: processingStatus,
            },
          ]);
        } catch (error) {
          // Handle upload errors
          let responseMessage = 'An error occurred during upload.';

          // Ensure responseMessage is a string
          if (error?.response?.data) {
            if (typeof error.response.data === 'string') {
              responseMessage = error.response.data;
            } else if (typeof error.response.data === 'object') {
              // Convert object to string representation
              try {
                responseMessage = JSON.stringify(error.response.data);
              } catch (e) {
                responseMessage = 'Error parsing response data';
              }
            }
          }

          setUploadStatus(prevStatus => [
            ...prevStatus,
            {
              file: file.name,
              status: 'Upload failed',
              remark: responseMessage,
            },
          ]);
        }

        // Update progress regardless of success or failure
        completedFiles++;
        const totalProgress = Math.round((completedFiles / selectedFiles.length) * 100);
        setOverallProgress(totalProgress);
      }

      // Final feedback after all uploads
      if (totalSuccess > 0) {
        toast.success(`${totalSuccess} PDF files uploaded and sent for processing.`);
      } else {
        toast.error('All uploads failed. Please check the errors.');
      }

    } catch (error) {
      console.error('Error during upload process:', error);
      toast.error('An unexpected error occurred during the upload process.');
    } finally {
      setUploading(false);
      setSelectedFiles([]);
      document.querySelector('input[type="file"]').value = ''; // Clear file input
    }
  };

  const handleSelectEntries = (event) => {
    setEntriesPerPage(parseInt(event.target.value, 10))
    setCurrentPage(1)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Sorting Function
  const sortedStatus = [...uploadStatus].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Pagination Logic
  const filteredStatus = sortedStatus.filter((status) =>
    status.file.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const calculateTotalPages = () => {
      setTotalPages(Math.ceil(filteredStatus.length / entriesPerPage))
    }
    calculateTotalPages()
  }, [filteredStatus, entriesPerPage])

  const indexOfLastItem = currentPage * entriesPerPage
  const indexOfFirstItem = indexOfLastItem - entriesPerPage
  const currentItems = filteredStatus.slice(indexOfFirstItem, indexOfLastItem)

  const renderPageNumbers = () => {
    const pages = []
    const totalPagesToShow = 5 // Number of page buttons to show
    const halfTotalPagesToShow = Math.floor(totalPagesToShow / 2)
    let startPage = Math.max(1, currentPage - halfTotalPagesToShow)
    let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1)

    if (totalPagesToShow > totalPages) {
      startPage = 1
      endPage = totalPages
    } else if (endPage - startPage < totalPagesToShow - 1) {
      startPage = endPage - totalPagesToShow + 1
    }

    if (startPage > 1) {
      pages.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} />)
    }

    if (currentPage > 1) {
      pages.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} />)
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>,
      )
    }

    if (currentPage < totalPages) {
      pages.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} />)
    }

    if (endPage < totalPages) {
      pages.push(<Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} />)
    }

    return pages
  }

  // Function to safely render table data
  const renderTableData = () => {
    try {
      return currentItems.map((status, index) => (
        <tr key={index}>
          <td>{status.file}</td>
          <td>
            {status.status === 'Uploaded successfully' ? (
              <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
            ) : (
              <FontAwesomeIcon icon={faTimesCircle} className="text-danger me-2" />
            )}
            {status.status}
          </td>
          <td>
            {/* Ensure remark is always a string */}
            {typeof status.remark === 'string'
              ? status.remark
              : safeStringify(status.remark)}
          </td>
        </tr>
      ));
    } catch (error) {
      console.error('Error rendering table data:', error);
      return (
        <tr>
          <td colSpan={3}>
            <Alert variant="warning">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Error rendering table data. Please try refreshing the page.
            </Alert>
          </td>
        </tr>
      );
    }
  };

  return (
    <ErrorBoundary>
      <ToastContainer />
      <Form>
        <Row>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Select a Program:</Form.Label>
              <Select
                value={selectedProgram}
                onChange={handleProgramChange}
                options={programs}
                placeholder="Select a program"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Select files to upload:</Form.Label>
              <Form.Control type="file" multiple onChange={handleFileChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="d-flex mt-4">
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
              >
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                Upload and Process
              </Button>
            </Form.Group>
          </Col>
          <Col md={4}>
            <div className="d-flex align-items-center justify-content-center h-100">
              {uploading ? (
                <Badge bg="primary" className="px-4 py-3 fs-6">
                  <FontAwesomeIcon icon={faSpinner} className="me-2 fa-spin" />
                  Processing Files...
                </Badge>
              ) : selectedFiles.length > 0 && (
                <Badge bg="success" className="px-4 py-3 fs-6">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  {selectedFiles.length} Files Selected
                </Badge>
              )}
            </div>
          </Col>
        </Row>

        {(overallProgress > 0 || uploading) && (
          <Row>
            <Col md={12} className="mt-3" >
              <FileUploadProgress
                totalFiles={selectedFiles.length}
                successCount={uploadSuccessCount}
                failedCount={uploadStatus.filter((status) => status.status === 'Upload failed').length}
                progress={overallProgress}
                isUploading={uploading}
              />
            </Col>
          </Row>
        )}
        {currentItems.length > 0 && (
          <div className="border border-3 p-4 py-2 my-3">
            <div className="d-flex justify-content-between mt-3">
              <div className="dataonpage">
                <p className="mb-2 d-flex align-items-center gap-1">
                  Show
                  <Form.Select value={entriesPerPage} onChange={handleSelectEntries} className="ms-2">
                    <option value="5">05</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select>
                  Entries
                </p>
              </div>
              <div className="search">
                <Form.Group className="mb-2 d-flex align-items-center gap-1">
                  <Form.Label className="mt-1">Search:</Form.Label>
                  <Form.Control type="text" value={searchTerm} onChange={handleSearchChange} />
                  <UploadFailFiles uploadStatus={uploadStatus} />
                </Form.Group>
              </div>
            </div>

            {/* Table */}
            <Row className="mt-3">
              <Col md={12}>
                <ErrorBoundary>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('file')}>File Name</th>
                        <th onClick={() => handleSort('status')}>Status</th>
                        <th onClick={() => handleSort('remark')}>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderTableData()}
                    </tbody>
                  </Table>
                </ErrorBoundary>
              </Col>
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <Row>
                <Col md={12}>
                  <div className="pagination justify-content-end">
                    <Pagination>{renderPageNumbers()}</Pagination>
                  </div>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Form>
    </ErrorBoundary>
  )
}

export default BulkPdfUpload
