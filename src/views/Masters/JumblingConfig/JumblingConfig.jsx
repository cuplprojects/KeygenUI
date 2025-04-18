import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Pagination, OverlayTrigger, Tooltip, Placeholder, Alert } from 'react-bootstrap';
import { useUser } from '../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const JumblingConfig = () => {
  const { keygenUser } = useUser();
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [configurationsPerPage] = useState(2);
  const [filteredConfigurations, setFilteredConfigurations] = useState([]);
  const [errorText, setErrorText] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    progID: 0,
    sets: '',
    setOrder: '',
    masterName: '',
    numberofQuestions: '',
    bookletSize: '',
    numberofJumblingSteps: '',
    setofSteps: ['']
  });

  const [sourceProject, setSourceProject] = useState('');
  const [destinationProject, setDestinationProject] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchPrograms();
    fetchSessions();
    fetchConfigurations();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.progID > 0) {
      if (!formData.bookletSize) {
        const filtered = configurations.filter(config => config.progID == formData.progID);
        setFilteredConfigurations(filtered);
      } else {
        const filtered = configurations.filter(config => config.progID == formData.progID && config.bookletSize == formData.bookletSize);
        setFilteredConfigurations(filtered);
      }
    } else {
      if (!formData.bookletSize) {
        setFilteredConfigurations(configurations);
      } else {
        const filtered = configurations.filter(config => config.bookletSize == formData.bookletSize);
        setFilteredConfigurations(filtered);
      }
    }
  }, [formData.progID, formData.bookletSize, configurations]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Programmes`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Sessions`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchConfigurations = async () => {
    try {
      setLoadingData(true);
      const response = await axios.get(`${baseUrl}/api/ProgConfigs`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      const configs = response.data;

      // Fetch steps for each configuration
      const configsWithSteps = await Promise.all(
        configs.map(async (config) => {
          const stepsResponse = await axios.get(`${baseUrl}/api/ProgConfigs/${config.progConfigID}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          return { ...config, steps: stepsResponse.data.steps };
        })
      );

      setConfigurations(configsWithSteps);
      setFilteredConfigurations(configsWithSteps);
      setLoadingData(false);
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Programmes`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert string numbers to integers for submission
      const dataForSubmission = {
        ...formData,
        numberofQuestions: parseInt(formData.numberofQuestions),
        bookletSize: parseInt(formData.bookletSize),
        sets: parseInt(formData.sets),
        numberofJumblingSteps: parseInt(formData.numberofJumblingSteps)
      };

      const response = await axios.post(`${baseUrl}/api/ProgConfigs`, dataForSubmission, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      if (response.status !== 200) {
        throw new Error('Failed to submit form');
      }

      const res = await axios.post(`${baseUrl}/api/FormData/GenerateKeyPattern`, dataForSubmission, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      
      // Reset form data
      setFormData({
        progID: 0,
        sets: '',
        setOrder: '',
        masterName: '',
        numberofQuestions: '',
        bookletSize: '',
        numberofJumblingSteps: '',
        setofSteps: ['']
      });
      fetchConfigurations();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleStepChange = (stepNumber, value) => {
    const newSetofSteps = [...formData.setofSteps];
    newSetofSteps[stepNumber - 1] = value;
    const splitValues = value.split(',').map(val => parseInt(val.trim(), 10));

    // Check if any number in splitValues is greater than the booklet size
    if (splitValues.some(val => val > parseInt(formData.bookletSize, 10))) {
      setErrorText("Numbers in step cannot be greater than booklet size")
      return;
    }

    // Check for duplicates
    if (new Set(splitValues).size !== splitValues.length) {
      setErrorText("Duplicate numbers in step")
      return;
    }
    else {
      setErrorText("")
    }
    setFormData({
      ...formData,
      setofSteps: newSetofSteps,
      [`step${stepNumber}`]: splitValues.join(', ') // Store the filtered values in formData
    });
  };

  const renderStepFields = () => {
    const fields = [];
    for (let i = 1; i <= formData.numberofJumblingSteps; i++) {
      const fieldName = `step${i}`;
      fields.push(
        <Col className='mb-2' key={fieldName}>
          <Form.Group controlId={fieldName}>
            <Form.Label><OverlayTrigger
              placement='right'
              overlay={
                <Tooltip id={`tooltip-${fieldName}`}>
                  Enter step {i} (Ex. 1,2)
                </Tooltip>
              }
            >
              <span>{`Step ${i} (Ex. 1,2)`}</span>
            </OverlayTrigger></Form.Label>
            <Form.Control
              type="text"
              value={formData.setofSteps[i - 1] || ''}
              onChange={(e) => handleStepChange(i, e.target.value.replace(/[^0-9,]/g, ''))}
              required
            />
          </Form.Group>
        </Col>
      );
    }
    return fields;
  };

  const handleImport = async () => {
    if (!sourceProject || !destinationProject) {
      setErrorText('Please select both source and destination projects.');
      return;
    }
    console.log(sourceProject, destinationProject)
    try {
      const response = await axios.post(`${baseUrl}/api/ProgConfigs/Import`, {
        sourceProgID: sourceProject,
        destinationProgID: destinationProject
      }, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      if (response.status === 200) {
        fetchConfigurations(); // Refresh configurations after import
        setErrorText('');
      } else {
        throw new Error('Failed to import configuration');
      }
    } catch (error) {
      console.error('Error importing configuration:', error);
      setErrorText('Error importing configuration.');
    }
  };

  const indexOfLastConfiguration = currentPage * configurationsPerPage;
  const indexOfFirstConfiguration = indexOfLastConfiguration - configurationsPerPage;
  const currentConfigurations = filteredConfigurations.slice(indexOfFirstConfiguration, indexOfLastConfiguration);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPlaceholderGrid = () => (
    <div className="d-flex flex-wrap">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="p-1" style={{ flexBasis: '100%', maxWidth: '100%' }}>
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} className='p-1' />
          </Placeholder>
        </div>
      ))}
    </div>
  );

  return (
    <Container>
      <Row className='row-cols-1 row-cols-md-2'>
        <Col>
          <Card>
          <Card.Header>
              <Card.Title className='text-center'>Previous Configurations</Card.Title>
            </Card.Header>
            <Card.Body>
              {loadingData ? (
                <Row>
                  <Col>{renderPlaceholderGrid()}</Col>
                  <Col>{renderPlaceholderGrid()}</Col>
                </Row>
              ) : filteredConfigurations.length === 0 ? (
                <p>No configurations found.</p>
              ) : (
                <>
                  <Row className='row-cols-1 row-cols-lg-2 '>
                    {currentConfigurations.map((config, index) => (
                      <Col key={index}>
                        <Card className='mt-2'>
                          <Card.Body>
                            <span>Program Name:</span><strong> {programs.find((program) => program.programmeID === config.progID)?.programmeName}</strong> <br />
                            <span>Number of Questions:</span><strong> {config.numberofQuestions}</strong> <br />
                            <span>Booklet Size:</span> <strong>{config.bookletSize} </strong><br />
                            <span>Number of Jumbling Steps:</span> <strong>{config.numberofJumblingSteps}</strong> <br />
                            <span>Steps:</span>
                            <ul>
                              {config.steps.map((step, idx) => (
                                <li key={idx}><strong>{`Step ${idx + 1}: ${step}`}</strong></li>
                              ))}
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div className="d-flex align-items-center gap-3 justify-content-center mt-3">
                    <Pagination>
                      <Pagination.First onClick={() => paginate(1)} />
                      {currentPage > 2 && <Pagination.Ellipsis />}
                      {currentPage > 1 && <Pagination.Item onClick={() => paginate(currentPage - 1)}>{currentPage - 1}</Pagination.Item>}
                      <Pagination.Item active>{currentPage}</Pagination.Item>
                      {currentPage < Math.ceil(filteredConfigurations.length / configurationsPerPage) && <Pagination.Item onClick={() => paginate(currentPage + 1)}>{currentPage + 1}</Pagination.Item>}
                      {currentPage < Math.ceil(filteredConfigurations.length / configurationsPerPage) - 1 && <Pagination.Ellipsis />}
                      <Pagination.Last onClick={() => paginate(Math.ceil(filteredConfigurations.length / configurationsPerPage))} />
                    </Pagination>
                    <p>Page {currentPage} of {Math.ceil(filteredConfigurations.length / configurationsPerPage)}</p>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className='h-100'>
            <Card.Header>
              <Card.Title className='text-center'>Create new configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {
                  formData.progID > 0 && formData.bookletSize && filteredConfigurations.length > 0 && (
                    <Alert variant="warning" className='p-2'>
                      Configration Already Exists.
                    </Alert>
                  )
                }
                <Row className='row-cols-1 row-cols-md-2'>
                  <Col className='mb-2'>
                    <Form.Group controlId="programID">
                      <Form.Label><OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip id={`tooltip-programID`}>
                            Select a program from the list.
                          </Tooltip>
                        }
                      >
                        <span>Program <span className='text-danger'>*</span></span>
                      </OverlayTrigger></Form.Label>
                      <Form.Control
                        as="select"
                        value={formData.progID}
                        onChange={(e) => handleInputChange('progID', e.target.value)}
                        required
                      >
                        <option value="">Select a program</option>
                        {programs.map((program) => (
                          <option key={program.programmeID} value={program.programmeID}>{program.programmeName}</option>
                        ))}
                      </Form.Control>

                    </Form.Group>
                  </Col>
                  <Col className='mb-2'>
                    <Form.Group controlId="bookletSize">
                      <Form.Label><OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip id={`tooltip-bookletSize`}>
                            Enter the size of the booklet, including cover page.
                          </Tooltip>
                        }
                      >
                        <span>Booklet Size <span className='text-danger'>*</span> </span>
                      </OverlayTrigger></Form.Label>
                      <Form.Control type="text" placeholder="Booklet Size" value={formData.bookletSize === '0' ? '' : formData.bookletSize} onChange={(e) => handleInputChange('bookletSize', e.target.value.replace(/\D/g, ''))} required />
                    </Form.Group>
                  </Col>
                  <Col className='mb-2'>
                    <Form.Group controlId="numberofQuestions">
                      <Form.Label>Number of Questions <span className='text-danger'>*</span> </Form.Label>
                      <Form.Control type="text" placeholder="Number of Questions" value={formData.numberofQuestions === '0' ? '' : formData.numberofQuestions} onChange={(e) => handleInputChange('numberofQuestions', e.target.value.replace(/\D/g, ''))} required />
                    </Form.Group>
                  </Col>
                  <Col className='mb-2'>
                    <Form.Group controlId="sets">
                      <Form.Label><OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip id={`tooltip-sets`}>
                            Enter the number of sets, including Master Set.
                          </Tooltip>
                        }
                      >
                        <span>Number of Sets <span className='text-danger'>*</span> </span>
                      </OverlayTrigger></Form.Label>
                      <Form.Control type="text" placeholder="Number of Sets" value={formData.sets === '0' ? '' : formData.sets} onChange={(e) => handleInputChange('sets', e.target.value.replace(/[^a-zA-Z0-9,]/g, ''))} required />
                    </Form.Group>
                  </Col>
                  <Col className='mb-2'>
                    <Form.Group controlId="setOrder">
                      <Form.Label>Set Order <span className='text-danger'>*</span> <span>(Ex. A,B,C,D)</span></Form.Label>
                      <Form.Control type="text" placeholder='Set Order ' value={formData.setOrder} onChange={(e) => handleInputChange('setOrder', e.target.value)} required />
                      {formData.setOrder.split(',')[0] && (
                        <Form.Label className='text-success'>{`Set ${formData.setOrder.split(',')[0]} will be master`}</Form.Label>
                      )}
                    </Form.Group>
                  </Col>

                  <Col className='mb-2'>
                    <Form.Group controlId="numberofJumblingSteps">
                      <Form.Label><OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip id={`tooltip-numberofJumblingSteps`}>
                            Enter the number of jumbling steps, How many iterations to perform.
                          </Tooltip>
                        }
                      >
                        <span>Number of Jumbling Steps <span className='text-danger'>*</span> </span>
                      </OverlayTrigger></Form.Label>
                      <Form.Control type="text" placeholder="Number of Jumbling Steps" value={formData.numberofJumblingSteps === '0' ? '' : formData.numberofJumblingSteps} onChange={(e) => handleInputChange('numberofJumblingSteps', e.target.value.replace(/\D/g, ''))} required />
                    </Form.Group>
                  </Col>
                  {renderStepFields()}
                </Row>
                <div className="text-center mt-3">
                  <p className='text-danger'>{errorText}</p>
                  <Button type="submit" disabled={errorText || filteredConfigurations.length > 0}>Add Configuration</Button>

                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='row-cols-1 mt-5'>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title className='text-center'>Import Configuration</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className='row-cols-1 row-cols-md-2'>
                  <Col className='mb-2'>
                    <Form.Group controlId="sourceProject">
                      <Form.Label>Source Project <span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                        as="select"
                        value={sourceProject}
                        onChange={(e) => setSourceProject(e.target.value)}
                        required
                      >
                        <option value="">Select source project</option>
                        {projects.map((project) => (
                          <option key={project.programmeID} value={project.programmeID}>{project.programmeName}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col className='mb-2'>
                    <Form.Group controlId="destinationProject">
                      <Form.Label>Destination Project <span className='text-danger'>*</span></Form.Label>
                      <Form.Control
                        as="select"
                        value={destinationProject}
                        onChange={(e) => setDestinationProject(e.target.value)}
                        required
                      >
                        <option value="">Select destination project</option>
                        {projects.map((project) => (
                          <option key={project.programmeID} value={project.programmeID}>{project.programmeName}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="text-center mt-3">
                  <Button onClick={handleImport} disabled={!sourceProject || !destinationProject}>Import Configuration</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default JumblingConfig;
