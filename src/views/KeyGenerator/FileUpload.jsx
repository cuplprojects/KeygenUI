import React, { useState, useRef } from 'react';
import { Col, Form, Row, Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const FileUpload = ({ setExcelFile, setFormData, setNumberOfQuestions, numberOfQuestions, disabled, catchNumber }) => {
  const [showCatchNumberModal, setShowCatchNumberModal] = useState(false);
  const [showQuestionCountModal, setShowQuestionCountModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCatchNumberConfirmed, setIsCatchNumberConfirmed] = useState(false);
  const [isQuestionCountConfirmed, setIsQuestionCountConfirmed] = useState(false);
  const [catchNumberModalMessage, setCatchNumberModalMessage] = useState('');
  const [questionCountModalMessage, setQuestionCountModalMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileNameWithoutExtension = file.name.split('.')[0];

      if (fileNameWithoutExtension !== catchNumber) {
        setSelectedFile(file);
        setIsCatchNumberConfirmed(false);
        setCatchNumberModalMessage(`The file name does not match the catch number. File name: ${file.name}, Catch number: ${catchNumber}`);
        setShowCatchNumberModal(true);
      } else {
        processFile(file);
      }
      resetFileInput();
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = 'Sheet1';
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const excelNumberOfQuestions = jsonData.length - 2;

      if (excelNumberOfQuestions > numberOfQuestions) {
        setSelectedFile(file);
        setIsQuestionCountConfirmed(false);
        setQuestionCountModalMessage(`The Excel file contains more questions (${excelNumberOfQuestions}) than expected (${numberOfQuestions}). Do you want to update the number of questions?`);
        setShowQuestionCountModal(true);
      } else {
        finalizeFileProcessing(file, jsonData, numberOfQuestions);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const finalizeFileProcessing = (file, jsonData, questionsCount) => {
    setExcelFile(file);
    const parsedData = Array.from({ length: questionsCount }, (_, index) => {
      const row = jsonData[index + 2] || [];
      return {
        sn: index + 1,
        qNumber: row[1] || '',
        key: row[2] || '',
        page: row[0] || '',
      };
    });

    setFormData(parsedData);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCatchNumberModalConfirm = () => {
    setShowCatchNumberModal(false);
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleQuestionCountModalConfirm = () => {
    setShowQuestionCountModal(false);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = 'Sheet1';
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const excelNumberOfQuestions = jsonData.length - 2;
        setNumberOfQuestions(excelNumberOfQuestions);
        finalizeFileProcessing(selectedFile, jsonData, excelNumberOfQuestions);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleCatchNumberModalCancel = () => {
    setShowCatchNumberModal(false);
    setSelectedFile(null);
  };

  const handleQuestionCountModalCancel = () => {
    setShowQuestionCountModal(false);
    setSelectedFile(null);
  };

  const handleCatchNumberCheckboxChange = (e) => {
    setIsCatchNumberConfirmed(e.target.checked);
  };

  const handleQuestionCountCheckboxChange = (e) => {
    setIsQuestionCountConfirmed(e.target.checked);
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
                ref={fileInputRef}
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

      <Modal show={showCatchNumberModal} onHide={handleCatchNumberModalCancel}>
        <Modal.Header closeButton>
          <Modal.Title>File Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {catchNumberModalMessage}
          
          <Form.Check
            className="mt-4"
            type="checkbox"
            label="I confirm that I want to proceed with this file"
            checked={isCatchNumberConfirmed}
            onChange={handleCatchNumberCheckboxChange}
          />
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="secondary" onClick={handleCatchNumberModalCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCatchNumberModalConfirm} disabled={!isCatchNumberConfirmed}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showQuestionCountModal} onHide={handleQuestionCountModalCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Question Count Mismatch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {questionCountModalMessage}
          <Form.Check
            className="mt-4"
            type="checkbox"
            label="I confirm that I want to proceed with this file"
            checked={isQuestionCountConfirmed}
            onChange={handleQuestionCountCheckboxChange}
          />
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="secondary" onClick={handleQuestionCountModalCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleQuestionCountModalConfirm} disabled={!isQuestionCountConfirmed}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

FileUpload.propTypes = {
  setExcelFile: PropTypes.func.isRequired,
  setNumberOfQuestions: PropTypes.func.isRequired,
  numberOfQuestions: PropTypes.number.isRequired,
  setFormData: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  catchNumber: PropTypes.string,
};

export default FileUpload;
