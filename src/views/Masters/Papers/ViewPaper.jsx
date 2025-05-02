// updated 23-01-2025
// added paper language selection
import React, { useState, useEffect } from 'react';
import { Form, Container, Row, Col, Card, Table, Button, Alert, Modal } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from './../../../context/Security';
import { useUser } from './../../../context/UserContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faKey, faFileExcel, faEdit } from '@fortawesome/free-solid-svg-icons';
import { formatDateTime, formatDateTimeForInput } from 'src/utils/DateFormate';

const baseUrl = process.env.REACT_APP_BASE_URL;

const ViewPaper = () => {
  const { keygenUser } = useUser();
  const { decrypt } = useSecurity();
  const { paperID } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formDisabled, setFormDisabled] = useState(true);
  const [buttonText, setButtonText] = useState('Update');
  const [keyDataUrl, setKeyDataUrl] = useState('');
  const [uploadAlert, setUploadAlert] = useState(null);
  const [masterKeyFile, setMasterKeyFile] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedKeyFile, setSelectedKeyFile] = useState(null);

  useEffect(() => {
    fetchPaper();
    fetchSubjects();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (paper && paper.paperID) {
      fetchKeyData(paper.paperID);
      fetchMasterKeyFile(paper.paperID);
    }
  }, [paper]);

  const handleChange = (name, value) => {
    setPaper({
      ...paper,
      [name]: value
    });
  };

  const handleKeyFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedKeyFile(file);
      setShowConfirmModal(true);
    }
  };

  const fetchKeyData = (paperID) => {
    axios.get(`${baseUrl}/api/ManualKeyExcelData/PaperID/${paperID}`, {
      headers: {
        Authorization: `Bearer ${keygenUser?.token}`
      }
    })
      .then(response => {
        setKeyDataUrl(response.data.manualKeyData);
      })
      .catch(error => {
        console.error('Error fetching key file data:', error);
      });
  };

  const fetchMasterKeyFile = (paperID) => {
    axios.get(`${baseUrl}/api/MasterKeyFile/PaperID/${paperID}`, {
      headers: {
        Authorization: `Bearer ${keygenUser?.token}`
      }
    })
      .then(response => {
        setMasterKeyFile(response.data.masterKeyFileData);
      })
      .catch(error => {
        console.error('Error fetching master key file:', error);
      });
  };

  const confirmUpload = () => {
    if (selectedKeyFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedKeyFile);
      reader.onload = () => {
        const binaryData = reader.result;

        const decryptedPaperID = decrypt(paperID);
        const userId = keygenUser?.userID || 0;
        const currentDateTime = new Date().toISOString();

        // Check if we already have key data to determine if we should update or create
        if (keyDataUrl) {
          // Update existing key data with PUT
          axios.put(`${baseUrl}/api/ManualKeyExcelData/PaperID/${decryptedPaperID}`, {
            paperID: decryptedPaperID,
            manualKeyData: binaryData,
            uploadedBy: userId,
            uploadedDateTime: currentDateTime
          }, {
            headers: {
              Authorization: `Bearer ${keygenUser?.token}`
            }
          }).then(() => {
            setUploadAlert(<Alert variant="success" onClose={() => setUploadAlert(null)} dismissible>Manual keys updated successfully</Alert>);
            fetchKeyData(paper.paperID);
            setShowConfirmModal(false);
            setSelectedKeyFile(null);
          }).catch(error => {
            setUploadAlert(<Alert variant="danger" onClose={() => setUploadAlert(null)} dismissible>Error updating keys: {error.message}</Alert>);
            setShowConfirmModal(false);
          });
        } else {
          // Create new key data with POST
          axios.post(`${baseUrl}/api/ManualKeyExcelData`, {
            paperID: decryptedPaperID,
            manualKeyData: binaryData,
            uploadedBy: userId,
            uploadedDateTime: currentDateTime
          }, {
            headers: {
              Authorization: `Bearer ${keygenUser?.token}`
            }
          }).then(() => {
            setUploadAlert(<Alert variant="success" onClose={() => setUploadAlert(null)} dismissible>Manual keys uploaded successfully</Alert>);
            fetchKeyData(paper.paperID);
            setShowConfirmModal(false);
            setSelectedKeyFile(null);
          }).catch(error => {
            setUploadAlert(<Alert variant="danger" onClose={() => setUploadAlert(null)} dismissible>Error uploading keys: {error.message}</Alert>);
            setShowConfirmModal(false);
          });
        }
      };
      reader.onerror = () => {
        console.error('Error reading the key file');
        setShowConfirmModal(false);
      };
    } else {
      console.error('No key file selected');
      setShowConfirmModal(false);
    }
  };

  const cancelUpload = () => {
    setSelectedKeyFile(null);
    setShowConfirmModal(false);
  };

  const handleDownload = () => {
    if (keyDataUrl) {
      try {
        const downloadLink = document.createElement('a');
        downloadLink.href = keyDataUrl;
        downloadLink.download = `${paper.catchNumber}_keys.xlsx`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setUploadAlert(<Alert variant="success" onClose={() => setUploadAlert(null)} dismissible>Download started successfully</Alert>);
      } catch (error) {
        console.error('Error downloading file:', error);
        setUploadAlert(<Alert variant="danger" onClose={() => setUploadAlert(null)} dismissible>Error downloading file</Alert>);
      }
    } else {
      setUploadAlert(<Alert variant="warning" onClose={() => setUploadAlert(null)} dismissible>No key data available to download</Alert>);
    }
  };

  const handleDownloadmaster = () => {
    if (masterKeyFile) {
      try {
        const downloadLink = document.createElement('a');
        downloadLink.href = masterKeyFile;
        downloadLink.download = `${paper.catchNumber}_master.xlsx`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setUploadAlert(<Alert variant="success" onClose={() => setUploadAlert(null)} dismissible>Master key download started successfully</Alert>);
      } catch (error) {
        console.error('Error downloading master key file:', error);
        setUploadAlert(<Alert variant="danger" onClose={() => setUploadAlert(null)} dismissible>Error downloading master key file</Alert>);
      }
    } else {
      setUploadAlert(<Alert variant="warning" onClose={() => setUploadAlert(null)} dismissible>No master key file data available to download</Alert>);
    }
  };


  const updatePaper = () => {
    axios.put(`${baseUrl}/api/Papers/${decrypt(paperID)}`, paper, {
      headers: { Authorization: `Bearer ${keygenUser?.token}` }
    })
      .then(() => {
        setFormDisabled(true);
        setButtonText('Update');
        fetchPaper();
        setUploadAlert(<Alert variant="success" onClose={() => setUploadAlert(null)} dismissible>Paper details updated successfully</Alert>);
      })
      .catch(error => {
        console.error('Error updating paper:', error);
        setUploadAlert(<Alert variant="danger" onClose={() => setUploadAlert(null)} dismissible>Error updating paper: {error.message}</Alert>);
      });
  };

  const fetchPaper = () => {
    fetch(`${baseUrl}/api/Papers/${decrypt(paperID)}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => response.json())
      .then(data => {
        setPaper(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching paper:', error);
        setLoading(false);
      });
  };

  const fetchSubjects = () => {
    fetch(`${baseUrl}/api/Subjects`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => response.json())
      .then(data => {
        setSubjects(data);
      })
      .catch(error => {
        console.error('Error fetching subjects:', error);
      });
  };

  const fetchCourses = () => {
    fetch(`${baseUrl}/api/Courses`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => response.json())
      .then(data => {
        setCourses(data);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
      });
  };

  const DownloadKey = async (paper) => {
    try {
      const progConfigResponse = await axios.get(`${baseUrl}/api/ProgConfigs/Programme/${paper.programmeID}/${paper.bookletSize}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      const progConfigData = progConfigResponse.data[0]; // Assuming the API returns an array with a single object
      const progConfigID = progConfigData.progConfigID;

      const paperData = {
        programmeID: paper.programmeID,
        paperID: paper.paperID,
        catchNumber: paper.catchNumber,
        progConfigID: progConfigID
      };
      localStorage.setItem('generatedKeys', JSON.stringify(paperData));
      navigate('/KeyGenerator/Newkey/download-keys');
    } catch (error) {
      console.error("Error fetching progConfigID:", error);
    }
  };



  const getLanguageText = (code) => {
    switch(code) {
      case 'B': return 'Bilingual';
      case 'H': return 'Hindi';
      case 'E': return 'English';
      case 'S': return 'Sanskrit';
      default: return code;
    }
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={cancelUpload} centered>
        <Modal.Header closeButton>
          <Modal.Title>{keyDataUrl ? 'Confirm Update' : 'Confirm Upload'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{keyDataUrl
            ? 'Are you sure you want to update the existing key file with the selected file?'
            : 'Are you sure you want to upload the selected key file?'}</p>
          {selectedKeyFile && (
            <p>
              <strong>File:</strong> {selectedKeyFile.name} ({Math.round(selectedKeyFile.size / 1024)} KB)
            </p>
          )}
          {keyDataUrl && (
            <Alert variant="warning">
              This will replace the existing key file. This action cannot be undone.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelUpload}>
            Cancel
          </Button>
          <Button variant={keyDataUrl ? "warning" : "primary"} onClick={confirmUpload}>
            {keyDataUrl ? 'Update' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>

      {loading && <div>Loading...</div>}
      {paper && (
        <>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <Card.Title className="text-center">Paper Details</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <tbody>
                      <tr>
                        <td>Program:</td>
                        <td>{paper.programmeName}</td>
                      </tr>
                      <tr>
                        <td>Catch Number:</td>
                        <td>{paper.catchNumber}</td>
                      </tr>
                      <tr>
                        <td>Course:</td>
                        <td>
                          {formDisabled ? (
                            paper.courseName
                          ) : (
                            <Form.Control as="select" value={paper.courseID} onChange={(e) => handleChange('courseID', e.target.value)}>
                              {courses.map(course => (
                                <option key={course.courseID} value={course.courseID}>{course.courseName}</option>
                              ))}
                            </Form.Control>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Exam Type:</td>
                        <td>
                          {formDisabled ? (
                            paper.examType
                          ) : (
                            <Form.Control
                              type='text'
                              value={paper.examType}
                              onChange={(e) => handleChange('examType', e.target.value)}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Subject:</td>
                        <td>
                          {formDisabled ? (
                            paper.subjectName
                          ) : (
                            <Form.Control as="select" value={paper.subjectID} onChange={(e) => handleChange('subjectID', e.target.value)}>
                              <option  value={0}>Select The Subject</option>
                              {subjects.map(subject => (
                                <option key={subject.subjectID} value={subject.subjectID}>{subject.subjectName}</option>
                              ))}
                            </Form.Control>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Paper Name:</td>
                        <td>
                          {formDisabled ? (
                            paper.paperName
                          ) : (
                            <Form.Control
                              type='text'
                              value={paper.paperName}
                              onChange={(e) => handleChange('paperName', e.target.value)}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Paper Language:</td>
                        <td>
                          {formDisabled ? (
                            getLanguageText(paper.language)
                          ) : (
                            <Form.Select
                              value={paper.language}
                              onChange={(e) => handleChange('language', e.target.value)}
                            >
                              <option value="">Select Language</option>
                              <option value="B">Bilingual</option>
                              <option value="H">Hindi</option>
                              <option value="E">English</option>
                              <option value="S">Sanskrit</option>
                            </Form.Select>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Exam DateTime:</td>
                        <td>
                          {formDisabled ? (
                            formatDateTime(paper.examDate)
                          ) : (
                            <Form.Control
                              type='datetime-local'
                              value={formatDateTimeForInput(paper.examDate)}
                              onChange={(e) => handleChange('examDate', e.target.value)}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Booklet Size:</td>
                        <td>
                          {formDisabled ? (
                            `${paper.bookletSize} Pages`
                          ) : (
                            <Form.Control
                              type='text'
                              value={paper.bookletSize}
                              onChange={(e) => handleChange('bookletSize', e.target.value)}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Number of Questions:</td>
                        <td>
                          {formDisabled ? (
                            paper.numberofQuestion
                          ) : (
                            <Form.Control
                              type='number'
                              value={paper.numberofQuestion}
                              onChange={(e) => handleChange('numberofQuestion', e.target.value)}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Paper Created By:</td>
                        <td>{paper.createdBy}</td>
                      </tr>
                      <tr>
                        <td>Paper Created DateTime:</td>
                        <td>{formatDateTime(paper.createdAt)}</td>
                      </tr>
                    </tbody>
                  </Table>
                  <div className="text-center">
                    <Button onClick={() => {
                      if (formDisabled) {
                        setFormDisabled(false);
                        setButtonText('Submit');
                      } else {
                        updatePaper();
                      }
                    }}>
                      {buttonText}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <Card.Title className="text-center">Paper Status</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="progress-container text-center">
                    <ol className="progress-meter">
                      <li className="progress-point done">Paper Added</li>
                      <li className={`progress-point ${paper.masterUploaded ? 'done' : 'todo'} `}>Master Uploaded</li>
                      <li className={`progress-point ${paper.keyGenerated ? 'done' : 'todo'} `}>Key Generated</li>
                    </ol>
                  </div>
                  <div className="mt-2 text-align-center justify-content-center d-flex gap-2">
                    {paper.masterUploaded ? (
                      !paper.keyGenerated ? (
                        <Button as={Link} to={'/KeyGenerator/Newkey'}>
                          <FontAwesomeIcon icon={faKey} className="me-2" />
                          Generate Keys
                        </Button>
                      ) : (
                        <Button onClick={()=>DownloadKey(paper)}>
                          <FontAwesomeIcon icon={faDownload} className="me-2" />
                          Download Keys
                        </Button>
                      )
                    ) : (
                      <Button as={Link} to={'/KeyGenerator/Newkey'}>
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        Upload Master
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
              <Card className='mt-4'>
                <Card.Header>
                  <Card.Title className="text-center">Manually Generated Keys</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="mt-2 text-center">
                    {keyDataUrl ? (
                      <>
                        {uploadAlert}
                        <p>Manual Keys Uploaded</p>
                        <div className="d-flex gap-2">
                          <Button onClick={handleDownload}>
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Download Manually Generated Keys
                          </Button>
                          <label htmlFor="key-update" className="btn btn-warning">
                            <FontAwesomeIcon icon={faEdit} className="me-2" />
                            Update Manually Generated Keys
                          </label>
                          <input
                            id="key-update"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleKeyFileChange}
                            style={{ display: 'none' }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {uploadAlert}
                        <p>Manually Generated Keys Not Uploaded </p>
                        <div className="mt-2 text-center">
                          <label htmlFor="key-upload" className="btn btn-primary">
                            <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                            Upload Manually Generated Keys
                          </label>
                          <input
                            id="key-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleKeyFileChange}
                            style={{ display: 'none' }}
                          />
                        </div>

                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
              <Card className='mt-4'>
                <Card.Header>
                  <Card.Title className="text-center">Master Key File</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="mt-2 text-center">
                    {masterKeyFile ? (
                      <>

                        <Button onClick={handleDownloadmaster}>
                          <FontAwesomeIcon icon={faDownload} className="me-2" />
                          Download Master Key File
                        </Button>
                      </>
                    ) : (
                      <Alert variant="warning">Master Key File Not Uploaded</Alert>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default ViewPaper;
