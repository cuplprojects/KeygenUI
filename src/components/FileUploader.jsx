import React, { useState, useRef } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload, faFileAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const FileUploader = ({ 
  onFilesSelected, 
  multiple = true, 
  accept = ".pdf", 
  maxFiles = null,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      // Filter by file type if accept is specified
      if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
        return false;
      }
      return true;
    });

    // Apply max files limit if specified
    const filesToAdd = maxFiles ? validFiles.slice(0, maxFiles) : validFiles;
    
    setSelectedFiles(filesToAdd);
    onFilesSelected(filesToAdd);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <Card 
      className={`mb-3 ${dragActive ? 'border-primary' : 'border-light'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Card.Body className="text-center p-4">
        <div className="mb-3">
          <FontAwesomeIcon 
            icon={faFileUpload} 
            size="3x" 
            className={dragActive ? 'text-primary' : 'text-secondary'} 
          />
        </div>
        
        <h5>Drag & Drop PDF Files Here</h5>
        <p className="text-muted">or</p>
        
        <Form.Control
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="d-none"
          disabled={disabled}
        />
        
        <Button 
          variant="outline-primary" 
          onClick={handleButtonClick}
          disabled={disabled}
        >
          Browse Files
        </Button>
        
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h6>Selected Files ({selectedFiles.length}):</h6>
            <div className="selected-files-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faFileAlt} className="me-2 text-primary" />
                    <span className="text-truncate" style={{ maxWidth: '200px' }}>{file.name}</span>
                    <small className="ms-2 text-muted">({(file.size / 1024).toFixed(1)} KB)</small>
                  </div>
                  <Button 
                    variant="link" 
                    className="text-danger p-0" 
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

FileUploader.propTypes = {
  onFilesSelected: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  accept: PropTypes.string,
  maxFiles: PropTypes.number,
  disabled: PropTypes.bool
};

export default FileUploader;
