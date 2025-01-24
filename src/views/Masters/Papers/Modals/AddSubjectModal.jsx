import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const AddSubjectModal = ({ show, handleClose, addSubject, subjects }) => {
  const [subjectName, setSubjectName] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setSubjectName(e.target.value);
    setError('');
  };

  const handleAddSubject = () => {
    if (!subjectName.trim()) {
      setError('Subject name cannot be empty.');
      return;
    }
    const isDuplicate = subjects.some(subject =>
      subject.subject_Name.toLowerCase() === subjectName.toLowerCase()
    );
    if (isDuplicate) {
      setError('Subject already exists.');
      return;
    }
    addSubject(subjectName);
    handleClose();
    setSubjectName('');
  };
  


  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Subject</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId='formSubjectName'>
            <Form.Label>Subject Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter subject name'
              value={subjectName}
              onChange={handleChange}
            />
          </Form.Group>
          {error && <Alert variant='danger'>{error}</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button variant='primary' onClick={handleAddSubject} disabled={!subjectName}>
          Add Subject
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

AddSubjectModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  addSubject: PropTypes.func.isRequired,
  subjects: PropTypes.array.isRequired,
};

export default AddSubjectModal;
