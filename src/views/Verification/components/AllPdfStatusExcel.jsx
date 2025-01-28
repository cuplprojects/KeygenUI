import React from 'react';  // Ensure React is in scope if using React < 17
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';  // Font Awesome download icon
import axios from 'axios';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';  // Import PropTypes for validation

const apiUrl = process.env.REACT_APP_BASE_API_URL;

const AllPdfStatusExcel = ({ programId }) => {
  const handleDownload = async () => {
    try {
      const response = await axios.get(`${apiUrl}/PDFfile/ExportStatusToExcel`, {
        params: { programId },  // Pass the programId as a query parameter
        responseType: 'blob',  // Important to specify response type as 'blob' to handle binary data
      });

      const fileName = 'AllPdfVerificationStatus.xlsx';  // You can dynamically set the file name if needed
      saveAs(response.data, fileName);  // Trigger the download
    } catch (error) {
      console.error('Error downloading the Excel file:', error);
    }
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="button-tooltip">Download the verification status as an Excel file</Tooltip>}
    >
      <Button onClick={handleDownload} disabled={!programId} size="sm">
        <FaDownload />
      </Button>
    </OverlayTrigger>
  );
};

// PropTypes for validation
AllPdfStatusExcel.propTypes = {
  programId: PropTypes.number.isRequired,  // programId should be a required number
};

export default AllPdfStatusExcel;
