import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Pagination, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useUser } from './../../context/UserContext';
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

  useEffect(() => {
    fetchPrograms();
    fetchSessions();
    fetchConfigurations();
  }, []);

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
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

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

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

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

      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
    else{
      setErrorText("")
    }
    setFormData({
      ...formData,
      setofSteps: newSetofSteps,
      [`step${stepNumber}`]: splitValues.join(', ') // Store the filtered values in formData
    });
  };


  const indexOfLastConfiguration = currentPage * configurationsPerPage;
  const indexOfFirstConfiguration = indexOfLastConfiguration - configurationsPerPage;
  const currentConfigurations = filteredConfigurations.slice(indexOfFirstConfiguration, indexOfLastConfiguration);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container>
      <Row className='row-cols-1 row-cols-md-2'>
        <Col>
          <Card>
            <Card.Body>
              <h2>Previous Configurations</h2>
              {filteredConfigurations.length === 0 ? (
                <p>No configurations found.</p>
              ) : (
                <>
                  <Row className='row-cols-1 row-cols-lg-2 '>
                    {currentConfigurations.map((config, index) => (
                      <Col key={index}>
                        <Card className='mt-2'>
                          <Card.Body>
                            <strong>Program Name:</strong> {programs.find((program) => program.programmeID === config.progID)?.programmeName} <br />
                            <strong>Number of Questions:</strong> {config.numberofQuestions} <br />
                            <strong>Booklet Size:</strong> {config.bookletSize} <br />
                            <strong>Number of Jumbling Steps:</strong> {config.numberofJumblingSteps} <br />
                            <strong>Steps:</strong>
                            <ul>
                              {config.steps.map((step, idx) => (
                                <li key={idx}>{`Step ${idx + 1}: ${step}`}</li>
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
          <Card>
            <Card.Body>
              <h3 className='text-center'>Create new configuration</h3>
              <Form onSubmit={handleSubmit}>
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
                            Enter the size of the booklet, Excluding cover page.
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
                  <Button type="submit" disabled={errorText}>Add Configuration</Button>
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
