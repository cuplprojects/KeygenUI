import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Alert } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Sessions = () => {
  const { keygenUser } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [existingSessions, setExistingSessions] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [sessions]); // Fetch sessions whenever there's a change in the sessions state

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Sessions`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
      if (response.data) {
        setSessions(response.data);
        setLoading(false);
        const existing = response.data.map(session => session.sessionName);
        setExistingSessions(existing);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAddSession = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/Sessions`,
        { sessionName: selectedSession },
        { headers: { Authorization: `Bearer ${keygenUser?.token}` } }
      );
      setSelectedSession(''); // Clear the selected session
      fetchSessions(); // Refresh the sessions list after adding a new session
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error adding session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <Card.Title className="text-center">Sessions</Card.Title>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Session ID</th>
                    <th>Session Name</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.sessionID}>
                      <td>{session.sessionID}</td>
                      <td>{session.sessionName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <Card.Body>
            {showSuccessAlert && (
                <Alert variant="success" onClose={() => setShowSuccessAlert(false)} dismissible>
                  Session added successfully!
                </Alert>
              )}
              <h5 className="card-title">Add Session</h5>
              <Form>
                <Form.Group controlId="formSession">
                  <Form.Select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                  >
                    <option value="">Select Session</option>
                    {[...Array(5)].map((_, index) => {
                      const year = new Date().getFullYear() - index;
                      const label = `${year}-${String(year + 1).slice(-2)}`;
                      const isDisabled = existingSessions.includes(label);
                      return <option key={index} value={label} disabled={isDisabled} >{label} {isDisabled && (<>Session Already Added</>)}</option>;
                    })}
                  </Form.Select>
                </Form.Group>
                <div className='mt-4 text-end'>
                  <Button variant="primary" onClick={handleAddSession} disabled={loading}>
                    {loading? 'Adding Session...' : 'Add Session'}
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

export default Sessions;