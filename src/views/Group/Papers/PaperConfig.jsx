import React, { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const PaperConfigForm = () => {
  const [formData, setFormData] = useState({
    id: 0,
    groupID: 0,
    sessionID: 0,
    paperID: 0,
    sets: 0,
    setOrder: '',
    masterName: '',
    numberofQuestions: 0,
    numberofJumblingSteps: 0,
    setofStepsID: 0,
    setofSteps: ['']
  });

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='id'>
              <Form.Label>ID</Form.Label>
              <Form.Control
                type='number'
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='groupID'>
              <Form.Label>Group ID</Form.Label>
              <Form.Control
                type='number'
                value={formData.groupID}
                onChange={(e) => handleChange('groupID', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='sessionID'>
              <Form.Label>Session ID</Form.Label>
              <Form.Control
                type='number'
                value={formData.sessionID}
                onChange={(e) => handleChange('sessionID', e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='paperID'>
              <Form.Label>Paper ID</Form.Label>
              <Form.Control
                type='number'
                value={formData.paperID}
                onChange={(e) => handleChange('paperID', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='sets'>
              <Form.Label>Sets</Form.Label>
              <Form.Control
                type='number'
                value={formData.sets}
                onChange={(e) => handleChange('sets', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='setOrder'>
              <Form.Label>Set Order</Form.Label>
              <Form.Control
                type='text'
                value={formData.setOrder}
                onChange={(e) => handleChange('setOrder', e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='masterName'>
              <Form.Label>Master Name</Form.Label>
              <Form.Control
                type='text'
                value={formData.masterName}
                onChange={(e) => handleChange('masterName', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='numberofQuestions'>
              <Form.Label>Number of Questions</Form.Label>
              <Form.Control
                type='number'
                value={formData.numberofQuestions}
                onChange={(e) => handleChange('numberofQuestions', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='numberofJumblingSteps'>
              <Form.Label>Number of Jumbling Steps</Form.Label>
              <Form.Control
                type='number'
                value={formData.numberofJumblingSteps}
                onChange={(e) => handleChange('numberofJumblingSteps', e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='setofStepsID'>
              <Form.Label>Set of Steps ID</Form.Label>
              <Form.Control
                type='number'
                value={formData.setofStepsID}
                onChange={(e) => handleChange('setofStepsID', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='setofSteps'>
              <Form.Label>Set of Steps</Form.Label>
              <Form.Control
                type='text'
                value={formData.setofSteps}
                onChange={(e) => handleChange('setofSteps', e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant='primary' type='submit'>Submit</Button>
      </Form>
    </Container>
  );
};

export default PaperConfigForm;
