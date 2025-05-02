import React from 'react';
import { Card, ProgressBar, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const FileUploadProgress = ({ 
  totalFiles, 
  successCount, 
  failedCount, 
  progress, 
  isUploading 
}) => {
  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faFileUpload} className="me-2 text-primary" />
            Upload Progress
          </h5>
          <div>
            <Badge bg="secondary" className="me-2">
              Total: {totalFiles}
            </Badge>
            <Badge bg="success" className="me-2">
              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
              Success: {successCount}
            </Badge>
            <Badge bg="danger">
              <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
              Failed: {failedCount}
            </Badge>
          </div>
        </div>
        
        <ProgressBar 
          now={progress} 
          label={`${progress}%`} 
          variant={isUploading ? "primary" : (failedCount > 0 ? "warning" : "success")} 
          animated={isUploading}
          striped
        />
        
        <div className="text-center mt-2 text-muted small">
          {isUploading 
            ? "Files are being uploaded and processed..." 
            : (progress === 100 
                ? `Upload complete. ${successCount} files processed successfully.` 
                : "Ready to upload files."
              )
          }
        </div>
      </Card.Body>
    </Card>
  );
};

FileUploadProgress.propTypes = {
  totalFiles: PropTypes.number.isRequired,
  successCount: PropTypes.number.isRequired,
  failedCount: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  isUploading: PropTypes.bool.isRequired
};

export default FileUploadProgress;
