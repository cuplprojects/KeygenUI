import React, { useState, useEffect } from 'react';
import { Form, Container, Row, Col, Card, Table, Button, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from './../../../context/Security';
import { useUser } from './../../../context/UserContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faKey } from '@fortawesome/free-solid-svg-icons';


// import Select from 'react-select';
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
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [uploadAlert, setUploadAlert] = useState(null);


  useEffect(() => {
    fetchPaper();
    fetchSubjects();
    fetchCourses();
  }, []);


  useEffect(() => {
    if (paper && paper.paperID) {
      fetchPdfData(paper.paperID);
    }
  }, [paper]);


  const handleChange = (name, value) => {
    setPaper({
      ...paper,
      [name]: value
    });
  };

  const handlePdfFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setPdfFile(selectedFile);
  };

  useEffect(() => {
    if (pdfFile) {
      handlePdfUpload();
    }
  }, [pdfFile]);


  const fetchPdfData = (paperID) => {
    axios.get(`${baseUrl}/api/BookletPdfData/PaperID/${paperID}`, {
      headers: {
        Authorization: `Bearer ${keygenUser?.token}`
      }
    })
      .then(response => {
        setPdfDataUrl(response.data.bookletData);
      })
      .catch(error => {
        console.error('Error fetching file data:', error);
      });
  };

  const handlePdfUpload = () => {
    if (pdfFile) {
      const reader = new FileReader();
      reader.readAsDataURL(pdfFile);
      reader.onload = () => {
        const binaryData = reader.result;

        const decryptedPaperID = decrypt(paperID);
        axios.post(`${baseUrl}/api/BookletPdfData`, { paperID: decryptedPaperID, bookletData: binaryData }, {
          headers: {
            Authorization: `Bearer ${keygenUser?.token}`
          }
        }).then(() => {
          setUploadAlert(<Alert variant="success" onClose={() => setUploadAlert(null)} dismissible>Booklet uploaded successfully</Alert>);
          fetchPdfData(paper.paperID);
          // Optionally, you can call fetchPaper() here to fetch updated paper data
        }).catch(error => {
          setUploadAlert(<Alert variant="danger" onClose={() => setUploadAlert(null)} dismissible>Error uploading PDF: {error.message}</Alert>);
        });
      };
      reader.onerror = () => {
        console.error('Error reading the PDF file');
      };
    } else {
      console.error('No PDF file selected');
    }
  };


  const handleDownload = () => {
    if (pdfDataUrl) {
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfDataUrl;
      downloadLink.download = `${paper.catchNumber}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else {
      console.error('No PDF data to download');
    }
  };

  const updatePaper = () => {
    axios.put(`${baseUrl}/api/Papers/${decrypt(paperID)}`, paper, {
      headers: { Authorization: `Bearer ${keygenUser?.token}` }
    })
      .then(response => {
        setFormDisabled(true);
        setButtonText('Update');
        fetchPaper();
      })
      .catch(error => {
        console.error('Error updating paper:', error);
        // Handle error appropriately, such as displaying an error message to the user
      });
  };

  const fetchPaper = () => {
    fetch(`${baseUrl}/api/Papers/${decrypt(paperID)}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => response.json())
      .then(data => {
        setPaper(data);
        console.log(data)
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
  


  const formatDateTimeForDisplay = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    // const seconds = date.getSeconds().toString().padStart(2, '0');
    const formattedDate = `${day}/${month}/${year}`;
    // const formattedTime = `${hours}:${minutes}:${seconds}`;
    const amPM = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12 || 12;

    return `${formattedDate} ${hours}:${minutes} ${amPM}`;
  };

  const formatDateTimeForInput = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;

    return `${formattedDate}T${formattedTime}`;
  };



  return (
    <Container className="userform border border-3 p-4 my-3">
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
                        <td>Exam DateTime:</td>
                        <td>
                          {formDisabled ? (
                            formatDateTimeForDisplay(paper.examDate)
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
                        <td>Paper Created By:</td>
                        <td>{paper.createdBy}</td>
                      </tr>
                      <tr>
                        <td>Paper Created DateTime:</td>
                        <td>{formatDateTimeForDisplay(paper.createdAt)}</td>
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
                  <Card.Title className="text-center">PDF Booklet Status</Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className="mt-2 text-center">
                    {pdfDataUrl ? (
                      <>
                        {uploadAlert}
                        <p>Booklet Uploaded</p>
                        <Button onClick={handleDownload}>
                          <FontAwesomeIcon icon={faDownload} className="me-2" />
                          Download Booklet
                        </Button>
                      </>
                    ) : (
                      <>
                        {uploadAlert}
                        <p>Booklet Not Uploaded </p>
                        <div className="mt-2 text-center">
                          <label htmlFor="pdf-upload" className="btn btn-primary">
                            <FontAwesomeIcon icon={faUpload} className="me-2" />
                            Upload PDF
                          </label>
                          <input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handlePdfFileChange}
                            style={{ display: 'none' }}
                          />
                        </div>

                      </>
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
