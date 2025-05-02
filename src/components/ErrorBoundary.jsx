import React, { Component } from 'react';
import { Alert, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });

    // You could also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-4">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p>
              An unexpected error occurred in the application. The details have been logged.
            </p>
            {this.state.error && (
              <div className="mt-3">
                <h6>Error Details:</h6>
                <pre className="bg-light p-2 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <hr />
            <div className="d-flex justify-content-end">
              <Button variant="outline-danger" onClick={this.handleReload}>
                Reload Application
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
};

export default ErrorBoundary;
