import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button } from 'react-bootstrap';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState('');
  const [existingSessions, setExistingSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, [sessions]); // Fetch sessions whenever there's a change in the sessions state

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Sessions`);
      if (response.data) {
        setSessions(response.data);
        setLoading(false);
        const existing = response.data.map(session => session.session_Name);
        setExistingSessions(existing);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAddSession = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/Sessions`, { session_Name: selectedSession });
      if (response.status === 200) {
        setSelectedSession(''); // Clear the selected session
      }
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6">
          <h3 className="text-center mb-3">Sessions</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Session Name</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.session_Id}>
                  <td>{session.session_Id}</td>
                  <td>{session.session_Name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="col-md-6">
          <Card>
            <Card.Body>
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
                      return <option key={index} value={label} disabled={isDisabled}>{label}</option>;
                    })}
                  </Form.Select>
                </Form.Group>
                <div className='mt-4 text-end'>
                  <Button variant="primary" onClick={handleAddSession}>Add Session</Button>
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
