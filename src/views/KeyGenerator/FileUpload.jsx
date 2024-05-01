import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const FileUpload = ({ setFormData, setNumberOfQuestions, disabled }) => {
  const [file, setFile] = useState(null);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = 'Sheet1'; // Specify the sheet name here
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const parsedData = jsonData.slice(2).filter(row => !isNaN(row[0]) && !isNaN(row[2])).map((row, index) => ({
          sn: index + 1,
          qNumber: row[0],
          key: row[1],
          page: row[2],
        }));
        setFormData(parsedData);
        console.log(parsedData)
        setNumberOfQuestions(parsedData.length);
      };
      reader.readAsArrayBuffer(file);
    }
  };
  return (
    <Form.Group>
<Row>
  <Col md={8} className="mx-auto">
    <div className="mt-2 text-center">
      <label htmlFor="excel-upload" className={`btn btn-outline-primary btn-block w-100 ${disabled ? 'disabled' : ''}`}>
        <FontAwesomeIcon icon={faUpload} className="me-2" />
        Upload Excel
      </label>
      <input
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

  );
};

FileUpload.propTypes = {
  setFormData: PropTypes.func.isRequired,
  setNumberOfQuestions: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default FileUpload;