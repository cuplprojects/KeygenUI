import React, { useState, useRef } from 'react';
import { Col, Form, Row, Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const FileUpload = ({ setExcelFile, setFormData, numberOfQuestions, disabled, catchNumber }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false); // State for the checkbox
  const fileInputRef = useRef(null);  // Reference to the file input for resetting

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileNameWithoutExtension = file.name.split('.')[0]; // Get the file name without extension

      if (fileNameWithoutExtension !== catchNumber) {
        // If the file name doesn't match the catch number, show the confirmation modal
        setSelectedFile(file);
        setIsConfirmed(false); // Reset checkbox when a new file is selected
        setShowModal(true);
      } else {
        processFile(file); // Process the file if it matches the catch number
      }
      // Reset the input value immediately after selecting a file
      resetFileInput();
    }
  };

  const processFile = (file) => {
    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = 'Sheet1'; // Specify the sheet name here
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const parsedData = Array.from({ length: numberOfQuestions }, (_, index) => {
        const row = jsonData[index + 2] || []; // Adjust index to start from the correct row
        return {
          sn: index + 1,
          qNumber: row[1] || '', // Default to empty string if undefined
          key: row[2] || '', // Default to empty string if undefined
          page: row[0] || '', // Default to empty string if undefined
        };
      });

      setFormData(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // Clear the file input value to allow re-uploading the same file
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    processFile(selectedFile); // Process the file even if the name doesn't match after confirmation
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setSelectedFile(null); // Clear the selected file if the user cancels
  };

  const handleCheckboxChange = (e) => {
    setIsConfirmed(e.target.checked); // Enable/disable the "Continue" button based on checkbox
  };

  return (
    <>
      <Form.Group>
        <Row>
          <Col md={8} className="mx-auto">
            <div className="mt-2 text-center">
              <label htmlFor="excel-upload" className={`btn btn-outline-primary btn-block w-100 ${disabled ? 'disabled' : ''}`}>
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                Upload Excel
              </label>
              <input
                ref={fileInputRef}  // Attach the ref to the input element
                id="excel-upload"
                type="file"
                accept=".xlsx"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                disabled={disabled}
              />
            </div>
          </Col>
        </Row>
      </Form.Group>

      <Modal show={showModal} onHide={handleModalCancel}>
        <Modal.Header closeButton>
          <Modal.Title>File Name Mismatch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The file name does not match the catch number. <br />
          File name:<strong> {selectedFile?.name} </strong><br />
          Catch number:<strong> {catchNumber} </strong><br />
          <Form.Check
            type="checkbox"
            label="I confirm that I want to proceed with this file"
            checked={isConfirmed}
            onChange={handleCheckboxChange}
          />
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="secondary" onClick={handleModalCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalConfirm} disabled={!isConfirmed}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

FileUpload.propTypes = {
  setExcelFile: PropTypes.func.isRequired,
  numberOfQuestions: PropTypes.number.isRequired,
  setFormData: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  catchNumber: PropTypes.string,
};

export default FileUpload;
