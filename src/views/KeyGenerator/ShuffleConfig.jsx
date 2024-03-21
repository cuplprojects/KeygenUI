import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
const baseUrl = process.env.REACT_APP_BASE_URL;

const ShuffleConfig = ({ selectedPaperData }) => {
  const [paperData, setPaperData] = useState({});
  const [iterations, setIterations] = useState('');
  const [copies, setCopies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaperData = async () => {
      try {
        const groupID = selectedPaperData.groupID;
        const sessionID = selectedPaperData.sessionID;
        const bookletSize = selectedPaperData.bookletSize;

        const response = await fetch(`${baseUrl}/api/PaperConfig/Group/Session?groupID=${groupID}&sessionID=${sessionID}&bookletsize=${bookletSize}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setPaperData(data);
        setCopies(data.paperConfig.sets.toString());
        setIterations(data.paperConfig.numberofJumblingSteps.toString());
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data. Please try again later.');
      }
    };

    fetchPaperData();
  }, [selectedPaperData.groupID, selectedPaperData.sessionID, selectedPaperData.bookletSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(paperData)
      const formData = {
        iterations: parseInt(paperData.paperConfig.numberofJumblingSteps),
        copies: parseInt(paperData.paperConfig.sets),
        setofSteps: paperData.steps.map(step => step.split(',').map(s => s.trim())),
        groupID: selectedPaperData.groupID,
        subjectID: selectedPaperData.subjectID,
        paperCode: selectedPaperData.paperCode,
        catchNumber: selectedPaperData.catchNumber,
        setID: 1,
      };
      console.log(formData)

      const url = `${baseUrl}/api/FormData/GenerateKey`;

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
      const steps = step.split(',').map(value => value.trim());
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
      <h3 className='text-center'>Jumbling Steps <hr /></h3>
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

        {error && <Alert variant="danger" className='mt-3'>{error}</Alert>}

        <div className="text-center">
          <Button type="submit" className='mt-3' disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Generate Keys'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

ShuffleConfig.propTypes = {
  selectedPaperData: PropTypes.object.isRequired,
};

export default ShuffleConfig;
