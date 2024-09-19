import React from 'react';
import PropTypes from 'prop-types';
import ExcelJS from 'exceljs';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

const DownloadFailedRecords = ({ failedRecords }) => {

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Failed Records');

    // Add headers
    const headers = ['Catch Number', 'Status', 'Message'];
    worksheet.addRow(headers);

    // Add data
    failedRecords.forEach(record => {
      worksheet.addRow([record.CatchNumber, record.Status, record.Message]);
    });

    // Format the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.columns = [
      { header: 'Catch Number', key: 'CatchNumber', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Message', key: 'Message', width: 40 },
    ];

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a Blob and download it
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'FailedRecords.xlsx';
    link.click();
  };

  return (
    <Button className='mb-2' size='sm' onClick={handleDownload} disabled={failedRecords.length === 0}>
     <FontAwesomeIcon icon={faDownload} title='Download Error Status' />
    </Button>
  );
};

DownloadFailedRecords.propTypes = {
  failedRecords: PropTypes.arrayOf(
    PropTypes.shape({
      CatchNumber: PropTypes.string.isRequired,
      Status: PropTypes.string.isRequired,
      Message: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DownloadFailedRecords;
