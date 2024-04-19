import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';

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
        setNumberOfQuestions(parsedData.length);
        console.log(parsedData)
      };
      reader.readAsBinaryString(file);
    }
  };
  return (
    <Form.Group>
      <Form.Label>Upload Excel File:</Form.Label>
      <Form.Control
        type="file"
        accept=".xlsx"
        onChange={handleFileInputChange}
        disabled={disabled} // Disable the input field if form is submitted and not in editing mode
      />
    </Form.Group>
  );
};

FileUpload.propTypes = {
  setFormData: PropTypes.func.isRequired,
  setNumberOfQuestions: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default FileUpload;