import React, { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AddPaper = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    paperName: '',
    groupID: '',
    sessionID: '',
    catchNumber: '',
    paperCode: '',
    program: '',
    examCode: '',
    subjectID: '',
    paperNumber: '',
    examDate: '',
    bookletSize: '',
    createdAt: '',
    createdBy: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7247/api/Papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to add paper');
      }
      navigate('/papers'); // Redirect to papers page after successful submission
    } catch (error) {
      console.error('Error adding paper:', error);
      setError('Failed to add paper. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      <h3>Add Paper</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className='mb-3' controlId='paperName'>
          <Form.Label>Paper Name</Form.Label>
          <Form.Control
            type='text'
            name='paperName'
            value={formData.paperName}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='groupID'>
          <Form.Label>Group ID</Form.Label>
          <Form.Control
            type='number'
            name='groupID'
            value={formData.groupID}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='sessionID'>
          <Form.Label>Session ID</Form.Label>
          <Form.Control
            type='number'
            name='sessionID'
            value={formData.sessionID}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='catchNumber'>
          <Form.Label>Catch Number</Form.Label>
          <Form.Control
            type='text'
            name='catchNumber'
            value={formData.catchNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='paperCode'>
          <Form.Label>Paper Code</Form.Label>
          <Form.Control
            type='text'
            name='paperCode'
            value={formData.paperCode}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='program'>
          <Form.Label>Program</Form.Label>
          <Form.Control
            type='text'
            name='program'
            value={formData.program}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='examCode'>
          <Form.Label>Exam Code</Form.Label>
          <Form.Control
            type='text'
            name='examCode'
            value={formData.examCode}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='subjectID'>
          <Form.Label>Subject ID</Form.Label>
          <Form.Control
            type='number'
            name='subjectID'
            value={formData.subjectID}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='paperNumber'>
          <Form.Label>Paper Number</Form.Label>
          <Form.Control
            type='text'
            name='paperNumber'
            value={formData.paperNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='examDate'>
          <Form.Label>Exam Date</Form.Label>
          <Form.Control
            type='date'
            name='examDate'
            value={formData.examDate}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='bookletSize'>
          <Form.Label>Booklet Size</Form.Label>
          <Form.Control
            type='number'
            name='bookletSize'
            value={formData.bookletSize}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='createdAt'>
          <Form.Label>Created At</Form.Label>
          <Form.Control
            type='date'
            name='createdAt'
            value={formData.createdAt}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className='mb-3' controlId='createdBy'>
          <Form.Label>Created By</Form.Label>
          <Form.Control
            type='text'
            name='createdBy'
            value={formData.createdBy}
            onChange={handleChange}
            required
          />
        </Form.Group>
        {error && <Alert variant='danger'>{error}</Alert>}
        <Button variant='primary' type='submit' disabled={loading}>
          {loading ? 'Adding...' : 'Add Paper'}
        </Button>
      </Form>
    </Container>
  );
};

export default AddPaper;
