import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddSubjectModal = ({ show, handleClose, addSubject }) => {
  const [subjectName, setSubjectName] = useState('');

  const handleSubmit = () => {
    addSubject(subjectName);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Subject</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId='subjectName'>
          <Form.Label>Subject Name</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter subject name'
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button variant='primary' onClick={handleSubmit}>
          Add Subject
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSubjectModal;
