import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Programs = () => {
  const { keygenUser } = useUser();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState('');
  const [existingPrograms, setExistingPrograms] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fetch programs on component mount and whenever programs state changes
  useEffect(() => {
    fetchPrograms();
  }, [programs]);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Programs`, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });
      if (response.data) {
        setPrograms(response.data);
        setLoading(false);
        const existing = response.data.map(program => program.programName.toLowerCase());
        setExistingPrograms(existing);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleAddProgram = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/Programs`, {
        programName,
        groupID: selectedGroup,
        sessionID: selectedSession,
        typeID: selectedType
      }, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });
      if (response.status === 201) {
        setProgramName('');
        setSelectedGroup('');
        setSelectedSession('');
        setSelectedType('');
        setExistingPrograms([...existingPrograms, programName.toLowerCase()]); // Clear the input field
        fetchPrograms(); // Refresh the programs list after adding a new program
      } else {
        // Handle potential API errors here (e.g., display error message to user)
        console.error('Program creation failed:', response);
      }
    } catch (error) {
      console.error('Error adding program:', error);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <Card.Title className="text-center">Programs</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Program ID</th>
                    <th>Program Name</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program) => (
                    <tr key={program.programID}>
                      <td>{program.programID}</td>
                      <td>{program.programName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <Card.Title>Add Program</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group controlId="formProgram">
                  <Form.Control
                    type="text"
                    placeholder="Enter program name"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="formGroup">
                  <Form.Select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="">Select Group</option>
                    {/* Populate the select options with groups */}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="formSession">
                  <Form.Select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    <option value="">Select Session</option>
                    {/* Populate the select options with sessions */}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="formType">
                  <Form.Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">Select Type</option>
                    {/* Populate the select options with types */}
                  </Form.Select>
                </Form.Group>
                <div className='mt-4 text-end'>
                  <Button variant="primary" onClick={handleAddProgram} disabled={existingPrograms.includes(programName.toLowerCase())}>
                    Add Program
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Programs;
