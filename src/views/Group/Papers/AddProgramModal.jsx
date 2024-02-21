import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const AddProgramModal = ({ show, handleClose, addProgram }) => {
  const [programName, setProgramName] = useState('');

  const handleChange = e => {
    setProgramName(e.target.value);
  };

  const handleAddProgram = () => {
    addProgram(programName);
    handleClose();
    setProgramName('');
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Program</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId='formProgramName'>
            <Form.Label>Program Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter program name'
              value={programName}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button variant='primary' onClick={handleAddProgram}>
          Add Program
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProgramModal;
