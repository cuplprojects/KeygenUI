import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Pagination } from 'react-bootstrap';

const JumblingConfig = () => {
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [configurationsPerPage] = useState(2);
  const [filteredConfigurations, setFilteredConfigurations] = useState([]);


  useEffect(() => {
    fetchGroups();
    fetchSessions();
    fetchConfigurations();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://api2.chandrakala.co.in/api/Group');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://api2.chandrakala.co.in/api/Sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchConfigurations = async () => {
    try {
      const response = await axios.get('http://api2.chandrakala.co.in/api/PaperConfig');
      setConfigurations(response.data);
      setFilteredConfigurations(response.data);
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };


  const [formData, setFormData] = useState({
    id: 0,
    groupID: '', // Changed from null to empty string
    sessionID: '', // Changed from null to empty string
    sets: 0,
    setOrder: '',
    masterName: '',
    numberofQuestions: 0,
    bookletSize: 0,
    numberofJumblingSteps: 0,
    setofStepsID: 0,
    setofSteps: ['']
  });


  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    filterConfigurations(field, value);
  };

  const filterConfigurations = () => {
    let filtered = configurations;
    if (formData.groupID) {
      console.log(formData.groupID)
      filtered = configurations.filter(config =>
        config.groupID === parseInt(formData.groupID)
      );
      console.log(filtered);
    }
    else if (formData.groupID && formData.sessionID) {
      console.log(formData.groupID,formData.sessionID)
      filtered = configurations.filter(config =>
        config.groupID === parseInt(formData.groupID) &&
        config.sessionID === parseInt(formData.sessionID)
      );
      console.log(filtered);
    }
    else if (formData.groupID && formData.sessionID && formData.bookletSize) {
      console.log(formData.groupID,formData.sessionID)
      filtered = configurations.filter(config =>
        config.groupID === parseInt(formData.groupID) &&
        config.sessionID === parseInt(formData.sessionID) &&
        config.bookletSize === parseInt(formData.bookletSize)
      );
      console.log(filtered);
    } 
  
    setFilteredConfigurations(filtered);
  };
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    try {
      const response = await axios.post('http://api2.chandrakala.co.in/api/PaperConfig', formData);
      if (response.status !== 201) {
        throw new Error('Failed to submit form');
      }

      // Reset form data if submission was successful
      setFormData({
        id: 0,
        groupID: '',
        sessionID: '',
        sets: 0,
        setOrder: '',
        masterName: '',
        numberofQuestions: 0,
        bookletSize: 0,
        numberofJumblingSteps: 0,
        setofStepsID: 0,
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
        <Col key={i}>
          <Form.Group controlId={fieldName}>
            <Form.Label>{`Step ${i}`}</Form.Label>
            <Form.Control
              type="text"
              value={formData.setofSteps[i - 1] || ''}
              onChange={(e) => handleStepChange(i, e.target.value)}
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
    setFormData({
      ...formData,
      setofSteps: newSetofSteps
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
                    {currentConfigurations.map((config) => (
                      <Col key={config.id} >
                        <Card className='mt-2'>
                          <Card.Body>
                            <strong>Master Name:</strong> {config.masterName} <br />
                            <strong>Group Name:</strong> {groups.find((group) => group.groupID === config.groupID)?.groupName} <br />
                            <strong>Session Name:</strong> {sessions.find((session) => session.session_Id === config.sessionID)?.session_Name} <br />
                            <strong>Number of Questions:</strong> {config.numberofQuestions} <br />
                            <strong>Booklet Size:</strong> {config.bookletSize} <br />
                            <strong>Number of Jumbling Steps:</strong> {config.numberofJumblingSteps} <br />
                            {/* <strong>Steps:</strong> {config.setofSteps.join(', ')} <br /> */}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div className="d-flex align-items-center gap-3 justify-content-center mt-3">
                    <Pagination>
                      <Pagination.First onClick={() => paginate(1)} />
                      {/* <Pagination.Prev onClick={() => paginate(currentPage - 1)} /> */}
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
              {/* <Alert variant="info">
                Create new configuration.
              </Alert> */}
              <Form onSubmit={handleSubmit}>
                <Row className='row-cols-1 row-cols-md-2'>
                  <Col>
                    <Form.Group controlId="groupID">
                      <Form.Label>Group</Form.Label>
                      <Form.Control as="select" value={formData.groupID} onChange={(e) => handleInputChange('groupID', e.target.value)} required>
                        <option value="">Select a group</option>
                        {groups.map((group) => (
                          <option key={group.groupID} value={group.groupID}>{group.groupName}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="sessionID">
                      <Form.Label>Session</Form.Label>
                      <Form.Control as="select" value={formData.sessionID} onChange={(e) => handleInputChange('sessionID', e.target.value)} required>
                        <option value="">Select a session</option>
                        {sessions.map((session) => (
                          <option key={session.session_Id} value={session.session_Id}>{session.session_Name}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="bookletSize">
                      <Form.Label>Booklet Size</Form.Label>
                      <Form.Control type="number" value={formData.bookletSize} onChange={(e) => handleInputChange('bookletSize', e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="numberofQuestions">
                      <Form.Label>Number of Questions</Form.Label>
                      <Form.Control type="number" value={formData.numberofQuestions} onChange={(e) => handleInputChange('numberofQuestions', e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="sets">
                      <Form.Label>Sets</Form.Label>
                      <Form.Control type="number" value={formData.sets} onChange={(e) => handleInputChange('sets', e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="setOrder">
                      <Form.Label>Set Order</Form.Label>
                      <Form.Control type="text" value={formData.setOrder} onChange={(e) => handleInputChange('setOrder', e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="masterName">
                      <Form.Label>Master Name</Form.Label>
                      <Form.Control type="text" value={formData.masterName} onChange={(e) => handleInputChange('masterName', e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="numberofJumblingSteps">
                      <Form.Label>Number of Jumbling Steps</Form.Label>
                      <Form.Control type="number" value={formData.numberofJumblingSteps} onChange={(e) => handleInputChange('numberofJumblingSteps', e.target.value)} required />
                    </Form.Group>
                  </Col>

                  {renderStepFields()}
                </Row>
                <div className="text-center mt-3">
                  <Button type="submit">Add Configuration</Button>
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
