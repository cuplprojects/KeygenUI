import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState('');
  const [currentSession, setCurrentSession] = useState('');
  const [nextSessions, setNextSessions] = useState([]);

  useEffect(() => {
    axios.get(`${baseUrl}/api/Sessions`)
      .then(response => {
        setSessions(response.data);
      })
      .catch(error => {
        console.error('Error fetching sessions:', error);
      });
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      const currentYear = new Date().getFullYear();
      const currentSessionName = `${currentYear}-${(currentYear % 100) + 1}`;
      setCurrentSession(currentSessionName);

      const nextSessionsList = [];
      for (let i = -5; i <= 0; i++) {
        const nextSessionName = `${currentYear + i}-${(currentYear + i) % 100 + 1}`;
        if (!sessions.find(session => session.session_Name === nextSessionName)) {
          nextSessionsList.push({ value: nextSessionName, label: nextSessionName });
        }
      }
      setNextSessions(nextSessionsList);
    }
  }, [sessions]);

  const addSession = () => {
    axios.post(`${baseUrl}/api/Sessions`, { session_Name: newSessionName })
      .then(response => {
        setSessions([...sessions, response.data]);
        setNewSessionName('');
      })
      .catch(error => {
        console.error('Error adding session:', error);
      });
  };

  return (
    <div>
      <Row>
        <Col md={6}>
          <h3>Previous Sessions</h3>
          <ul>
            {sessions.map(session => (
              <li key={session.session_Id}>{session.session_Name}</li>
            ))}
          </ul>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h3>Add New Session</h3>
              <Form.Group controlId="formNewSession">
                <Select
                  options={[{ value: currentSession, label: currentSession }, ...nextSessions]}
                  onChange={(selectedOption) => setNewSessionName(selectedOption.value)}
                  value={{ value: newSessionName, label: newSessionName }}
                  isOptionDisabled={(option) => sessions.find(session => session.session_Name === option.value)}
                />
              </Form.Group>
             <div className="text-end mt-2">
             <Button onClick={addSession}>Add Session</Button>
             </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Sessions;
