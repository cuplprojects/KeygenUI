import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const PaperConfigForm = () => {
  const { groupID, sessionID, paperID } = useParams();

  const [formData, setFormData] = useState({
    id: 0,
    groupID: groupID ? parseInt(groupID) : 0,
    sessionID: sessionID ? parseInt(sessionID) : 0,
    paperID: paperID ? parseInt(paperID) : 0,
    sets: 0,
    setOrder: '',
    masterName: '',
    numberofQuestions: 0,
    numberofJumblingSteps: 0,
    setofStepsID: 0,
    setofSteps: [] // Updated to empty array
  });

  const [hasDuplicates, setHasDuplicates] = useState(false);

  const handleChange = (name, value) => {
    if (name.startsWith('step')) {
      const stepNumber = parseInt(name.replace('step', ''));
      const newSetofSteps = [...formData.setofSteps];
      newSetofSteps[stepNumber - 1] = value;
      setFormData({
        ...formData,
        setofSteps: newSetofSteps
      });
    } else if (name === 'setOrder') {
      const setOrderArray = value.split(',').map(item => item.trim());
      const hasDuplicates = new Set(setOrderArray).size !== setOrderArray.length;
      setHasDuplicates(hasDuplicates);
      setFormData({
        ...formData,
        setOrder: value,
        masterName: setOrderArray.length > 0 ? setOrderArray[0] : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'sets' || name === 'numberofQuestions' || name === 'numberofJumblingSteps' || name === 'setofStepsID' ? parseInt(value) : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    if (hasDuplicates) {
      alert('Duplicate entries found in Set Order. Please correct before submitting.');
      return;
    }

    try {
      const response = await fetch('https://localhost:7247/api/PaperConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Reset form data if submission was successful
      setFormData({
        id: 0,
        groupID: 0,
        sessionID: 0,
        paperID: 0,
        sets: 0,
        setOrder: '',
        masterName: '',
        numberofQuestions: '',
        numberofJumblingSteps: 0,
        setofStepsID: 0,
        setofSteps: []
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
        <Col key={i} md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>{`Step ${i} `}<span className='text-danger'> *</span></Form.Label>
            <Form.Control
              type='text'
              value={formData[fieldName]}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              required
            />
          </Form.Group>
        </Col>
      );
    }
    return fields;
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='sets'>
              <Form.Label>Sets<span className='text-danger'> *</span></Form.Label>
              <Form.Control
                type='number'
                value={formData.sets}
                onChange={(e) => handleChange('sets', e.target.value)}
                min={0}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='setOrder'>
              <Form.Label>Set Order<span className='text-danger'> *</span></Form.Label>
              <Form.Control
                type='text'
                value={formData.setOrder}
                onChange={(e) => handleChange('setOrder', e.target.value)}
                required
              />
              {hasDuplicates && <Alert variant='danger'>Duplicate entries found in Set Order.</Alert>}
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='masterName'>
              <Form.Label>Master Set Name<span className='text-danger'> *</span></Form.Label>
              <Form.Control
                type='text'
                value={formData.masterName}
                onChange={(e) => handleChange('masterName', e.target.value)}
                disabled
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='numberofQuestions'>
              <Form.Label>Number of Questions<span className='text-danger'> *</span></Form.Label>
              <Form.Control
                type='number'
                value={formData.numberofQuestions}
                onChange={(e) => handleChange('numberofQuestions', e.target.value)}
                min={0}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='numberofJumblingSteps'>
              <Form.Label>Number of Jumbling Steps<span className='text-danger'> *</span></Form.Label>
              <Form.Control
                type='number'
                value={formData.numberofJumblingSteps}
                onChange={(e) => handleChange('numberofJumblingSteps', e.target.value)}
                min={0}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          {renderStepFields()}
        </Row>
        <Button variant='primary' type='submit'>Submit</Button>
      </Form>
    </Container>
  );
};

export default PaperConfigForm;
