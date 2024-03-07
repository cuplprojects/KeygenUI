import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const ShuffleConfig = ({ paperID }) => {
  const [paperData, setPaperData] = useState({});
  const [iterations, setIterations] = useState('');
  const [copies, setCopies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaperData = async () => {
      try {
        const response = await fetch(`https://localhost:7247/api/PaperConfig/GetByPaperID/${paperID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setPaperData(data);
        setCopies(data.paperConfig.sets);
        setIterations(data.paperConfig.numberofJumblingSteps);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data. Please try again later.');
      }
    };

    fetchPaperData();
  }, [paperID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = {
        iterations: parseInt(iterations),
        copies: parseInt(copies),
        setofSteps: paperData.steps.map(step => step.steps.split(',').map(s => s.trim())),
        groupID: paperData.group.groupID,
        subjectID: paperData.paper.subjectID,
        paperCode: paperData.paper.paperCode,
        catchNumber: paperData.paper.catchNumber,
        setID: 1,
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
        const responseData = await response.json();
        console.log('Data sent successfully!');

        // Save response data to localStorage
        localStorage.setItem('generatedKeys', JSON.stringify(responseData));

        navigate('/KeyGenerator/download-keys');
      } else {
        throw new Error('Failed to send data.');
      }
    } catch (error) {
      console.error('Error sending data:', error);
      setError('An error occurred while sending data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  const renderSetOfStepsFields = () => {
    const fields = [];
    for (let i = 0; i < paperData?.steps?.length; i++) {
      const step = paperData.steps[i];
      const steps = step.steps.split(',').map(value => value.trim());
      const stepField = (
        <Form.Group key={i} className='mt-2'>
          <Form.Label>{`Set of Steps ${i + 1}: (Ex. 10,20)`}</Form.Label>
          <Form.Control
            type="text"
            placeholder={`Enter set of steps ${i + 1}`}
            defaultValue={steps.join(',')}
            disabled
          />
        </Form.Group>
      );
      fields.push(stepField);
    }
    return fields;
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      <h3 className='text-center'>Give Jumbling Steps <hr /></h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className='mt-2'>
          <Form.Label>No. Of Copies:</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter copies"
            value={copies}
            onChange={(e) => setCopies(e.target.value)}
            disabled
          />
        </Form.Group>

        <Form.Group className='mt-2'>
          <Form.Label>No. of Jumbling Iterations:</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter iterations"
            value={iterations}
            onChange={(e) => setIterations(e.target.value)}
            disabled
          />
        </Form.Group>

        {renderSetOfStepsFields()}

        {error && <Alert variant="danger">{error}</Alert>}

        <Button type="submit" className='mt-3' disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : 'Submit'}
        </Button>
      </Form>
    </Container>
  );
};

ShuffleConfig.propTypes = {
  paperID: PropTypes.number.isRequired,
};

export default ShuffleConfig;
