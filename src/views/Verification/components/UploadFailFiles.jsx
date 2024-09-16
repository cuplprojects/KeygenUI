// src/components/UploadFailFiles.js

import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Button } from 'react-bootstrap';
import ExcelJS from 'exceljs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const UploadFailFiles = ({ uploadStatus }) => {
  const handleDownload = async () => {
    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Upload Status');

    // Define the header row
    worksheet.columns = [
      { header: 'File Name', key: 'file', width: 30 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Remark', key: 'remark', width: 40 },
    ];

    // Add data to worksheet
    uploadStatus.forEach(status => {
      worksheet.addRow({
        file: status.file,
        status: status.status,
        remark: status.remark,
      });
    });

    // Generate Excel file and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upload_status.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button variant="primary" onClick={handleDownload}>
      <FontAwesomeIcon icon={faDownload}/>
    </Button>
  );
};

// Define PropTypes for the component
UploadFailFiles.propTypes = {
  uploadStatus: PropTypes.arrayOf(
    PropTypes.shape({
      file: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      remark: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default UploadFailFiles;
