import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ShuffleConfig = () => {
  const [apiResponse, setApiResponse] = useState(JSON.parse(localStorage.getItem('apiResponse')) || {});
  const [iterations, setIterations] = useState('');
  const [copies, setCopies] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error message
  const navigate = useNavigate();

  const handleIterationsChange = (e) => {
    setIterations(e.target.value);
  };

  useEffect(() => {
    if (apiResponse && apiResponse.answerKey_Name) {
      setFileName(apiResponse.answerKey_Name);
    }
  }, [apiResponse]);

  const handleCopiesChange = (e) => {
    setCopies(e.target.value);
  };

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading indicator
    setError(null); // Clear previous error message

    try {
      const setofSteps = [];
      for (let i = 1; i <= iterations; i++) {
        const fieldName = `steps${i}`;
        const stepValue = document.getElementById(fieldName).value;
        const individualValues = stepValue.split(',').map(value => value.trim()); // Split the string and trim spaces
        setofSteps.push(individualValues);
      }

      const formData = {
        fileName: apiResponse.answerKey_Name,
        filePath: apiResponse.answerKey_filePath,
        iterations,
        copies,
        setofSteps,
      };

      const url = 'https://localhost:7247/api/FormData/GenerateKey';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Data sent successfully!');
        navigate('/KeyGenerator/download-keys'); // Redirect to download keys page
      } else {
        throw new Error('Failed to send data.');
      }
    } catch (error) {
      console.error('Error sending data:', error);
      setError('An error occurred while sending data. Please try again later.'); // Set error message
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const generateSetOfStepsFields = () => {
    const fields = [];
    for (let i = 1; i <= iterations; i++) {
      const fieldName = `steps${i}`;
      fields.push(
        <Form.Group key={i} className='mt-2'>
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip}
          >
            <Form.Label>{`Set of Steps ${i}: (Ex. 10,20)`}</Form.Label>
          </OverlayTrigger>
          <Form.Control type="text" placeholder={`Enter set of steps ${i}`} id={fieldName} />
        </Form.Group >
      );
    }
    return fields;
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Enter the page number(s) you want to bring to the top in this step
    </Tooltip>
  );
  const renderJumbletip = (props1) => (
    <Tooltip id="button-tooltip" {...props1}>
      Enter the number of times you want to jumble the Answer-Key
    </Tooltip>
  );

  return (
    <Container className="userform border border-3 p-4 my-3">
      <h3 className='text-center'>Give Jumbling Steps <hr /></h3>
      <Form onSubmit={handleSubmit} >
        <Form.Group className='mt-2'>
          <Form.Label>No. Of Copies:</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter copies"
            value={copies}
            onChange={handleCopiesChange}
          />
        </Form.Group>

        <Form.Group className='mt-2'>
          <OverlayTrigger
            placement="right"
            delay={{ show: 250, hide: 400 }}
            overlay={renderJumbletip}
          >
            <Form.Label>No. of Jumbling Iterations:</Form.Label>
          </OverlayTrigger>

          <Form.Control
            type="number"
            placeholder="Enter iterations"
            value={iterations}
            onChange={handleIterationsChange}
          />
        </Form.Group>

        {generateSetOfStepsFields()}

        {error && <Alert variant="danger">{error}</Alert>} {/* Display error message if present */}

        <Button type="submit" className='mt-3' disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Submit'}
        </Button>
      </Form>
    </Container>
  );
};

export default ShuffleConfig;
