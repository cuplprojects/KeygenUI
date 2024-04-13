import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Pagination } from 'react-bootstrap';
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
      const response = await axios.get(`${baseUrl}/api/PaperConfig`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      setConfigurations(response.data);
      setFilteredConfigurations(response.data);
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  const [formData, setFormData] = useState({
    programID: '', // Changed from null to empty string
    sets: 0,
    setOrder: '',
    masterName: '',
    numberofQuestions: 0,
    bookletSize: 0,
    numberofJumblingSteps: 0,
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
    if (formData.programID) {
      filtered = configurations.filter(config =>
        config.programID === parseInt(formData.programID)
      );
    }
    setFilteredConfigurations(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    try {
      const response = await axios.post(`${baseUrl}/api/PaperConfig`, formData, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      if (response.status !== 201) {
        throw new Error('Failed to submit form');
      }

      // Reset form data if submission was successful
      setFormData({
        programID: '',
        sets: 0,
        setOrder: '',
        masterName: '',
        numberofQuestions: 0,
        bookletSize: 0,
        numberofJumblingSteps: 0,
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
                            <strong>Program Name:</strong> {programs.find((program) => program.programmeID === config.programID)?.programName} <br />
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
                  <Col>
                    <Form.Group controlId="programID">
                      <Form.Label>Program</Form.Label>
                      <Form.Control as="select" value={formData.programID} onChange={(e) => handleInputChange('programID', e.target.value)} required>
                        <option value="">Select a program</option>
                        {programs.map((program) => (
                          <option key={program.programmeID} value={program.programmeID}>{program.programName}</option>
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
