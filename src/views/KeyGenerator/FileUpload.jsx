import React from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

const FileUpload = ({ setFormData, setNumberOfQuestions, disabled }) => {
  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        const rows = content.split('\n').map((row) => row.split(','));

        // const parsedData = rows.slice(1,-1).map((row, index) => ({
        //   sn: index + 1,
        //   page: row[0] || '',
        //   qNumber: row[1] || '',
        //   key: row[2] || '',
        // }));

        
        const parsedData = rows.slice(1,-1).map((row, index) => ({
          sn: index + 1,
          qNumber: row[0] || '',
          key: row[1] || '',
          page: row[2] || '',
        }));

        setNumberOfQuestions(parsedData.length);
        setFormData(parsedData);
      };

      reader.readAsText(file);
    }
  };

  return (
    <Form.Group>
      <Form.Label>Upload CSV File:</Form.Label>
      <Form.Control
        type="file"
        accept=".csv"
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
