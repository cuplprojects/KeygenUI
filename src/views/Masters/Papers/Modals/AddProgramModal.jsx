import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const AddProgramModal = ({ show, handleClose, addProgram, programs }) => {
  const [programName, setProgramName] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setProgramName(e.target.value);
    setError('');
  };

  const handleAddProgram = () => {
    if (!programName.trim()) {
      setError('Program name cannot be empty.');
      return;
    }
    const isDuplicate = programs.some(program =>
      program.programName.toLowerCase() === programName.toLowerCase()
    );
    if (isDuplicate) {
      setError('Program already exists.');
      return;
    }
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
          {error && <Alert variant='danger'>{error}</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button variant='primary' onClick={handleAddProgram} disabled={!programName}>
          Add Program
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

AddProgramModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  addProgram: PropTypes.func.isRequired,
  programs: PropTypes.array.isRequired,
};

export default AddProgramModal;
