import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from './../../../context/UserContext';

const ViewPaper = () => {
  const { keygenUser } = useUser();
  const userId = keygenUser?.user_ID;

  const navigate = useNavigate();
  const { paperID } = useParams();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null); // Define error state

  const handleChange = (name, value) => {
    setPaper({
      ...paper,
      [name]: value
    });
  };

  const fetchPaper = () => {
    fetch(`http://api2.chandrakala.co.in/api/Papers/${paperID}`)
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

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://api2.chandrakala.co.in/api/Papers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paper)
      });
      if (!response.ok) {
        throw new Error('Failed to update paper');
      }
      setEditing(false);
    } catch (error) {
      console.error('Error updating paper:', error);
      setError('Failed to update paper. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaper();
  }, []);

  return (
    <Container className="userform border border-3 p-4 my-3">
      <h3>View Paper</h3>
      {loading && <div>Loading...</div>}
      {paper && (
        <Form onSubmit={handleSubmit}>
          <Row className='mb-3'>
            <Col>
              <Form.Group controlId='paperName'>
                <Form.Label>Paper Name</Form.Label>
                <Form.Control
                  type='text'
                  name='paperName'
                  value={paper.paperName}
                  onChange={(e) => handleChange('paperName', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='catchNumber'>
                <Form.Label>Catch Number</Form.Label>
                <Form.Control
                  type='text'
                  name='catchNumber'
                  value={paper.catchNumber}
                  onChange={(e) => handleChange('catchNumber', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='paperCode'>
                <Form.Label>Paper Code</Form.Label>
                <Form.Control
                  type='text'
                  name='paperCode'
                  value={paper.paperCode}
                  onChange={(e) => handleChange('paperCode', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className='mb-3'>
            <Col>
              <Form.Group controlId='program'>
                <Form.Label>Program</Form.Label>
                <Form.Control
                  type='text'
                  name='program'
                  value={paper.program}
                  onChange={(e) => handleChange('program', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='examCode'>
                <Form.Label>Exam Code</Form.Label>
                <Form.Control
                  type='text'
                  name='examCode'
                  value={paper.examCode}
                  onChange={(e) => handleChange('examCode', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='subjectID'>
                <Form.Label>Subject ID</Form.Label>
                <Form.Control
                  type='text'
                  name='subjectID'
                  value={paper.subjectID}
                  onChange={(e) => handleChange('subjectID', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className='mb-3'>
            <Col>
              <Form.Group controlId='paperNumber'>
                <Form.Label>Paper Number</Form.Label>
                <Form.Control
                  type='text'
                  name='paperNumber'
                  value={paper.paperNumber}
                  onChange={(e) => handleChange('paperNumber', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='examDate'>
                <Form.Label>Exam Date</Form.Label>
                <Form.Control
                  type='date'
                  name='examDate'
                  value={paper.examDate}
                  onChange={(e) => handleChange('examDate', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='bookletSize'>
                <Form.Label>Booklet Size</Form.Label>
                <Form.Control
                  type='text'
                  name='bookletSize'
                  value={paper.bookletSize}
                  onChange={(e) => handleChange('bookletSize', e.target.value)}
                  required
                  disabled={!editing}
                />
              </Form.Group>
            </Col>
          </Row>
          {error && <Alert variant='danger'>{error}</Alert>}
          {!editing && (
            <Button variant='primary' onClick={handleEdit}>
              Edit
            </Button>
          )}
          {editing && (
            <Button variant='primary' type='submit'>
              Save
            </Button>
          )}
        </Form>
      )}
    </Container>
  );
};

export default ViewPaper;
