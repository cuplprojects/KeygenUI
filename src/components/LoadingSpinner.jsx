import React from 'react';
import { Spinner, Card, ProgressBar } from 'react-bootstrap';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  progress = null, 
  variant = 'primary',
  size = 'md',
  showCard = true
}) => {
  const spinnerSize = size === 'sm' ? '' : size === 'lg' ? 'spinner-border-lg' : '';
  
  const content = (
    <div className="text-center p-3">
      <Spinner 
        animation="border" 
        role="status" 
        variant={variant}
        className={`mb-2 ${spinnerSize}`}
      />
      <div className="mt-2 mb-2">{message}</div>
      {progress !== null && (
        <ProgressBar 
          now={progress} 
          label={`${progress}%`} 
          variant={variant} 
          animated 
          striped 
          className="mt-2"
        />
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card className="shadow-sm border-light">
        <Card.Body>
          {content}
        </Card.Body>
      </Card>
    );
  }

  return content;
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  progress: PropTypes.number,
  variant: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showCard: PropTypes.bool
};

export default LoadingSpinner;
