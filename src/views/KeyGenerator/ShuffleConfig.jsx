// import React, { useState, useEffect } from 'react';
// import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import { useUser } from './../../context/UserContext';
// const baseUrl = process.env.REACT_APP_BASE_URL;

// const ShuffleConfig = ({ selectedPaperData }) => {
//   const {keygenUser} = useUser();
//   const [paperData, setPaperData] = useState({});
//   const [iterations, setIterations] = useState('');
//   const [copies, setCopies] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [pcid, setPcid] = useState();
//   const [stepsData, setStepsData] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchPaperData = async () => {
//       try {
//         const programme2 = selectedPaperData.programmeID;
//         const bookletSize2 = selectedPaperData.bookletSize;

//         const progconfigforjumble = await fetch(`${baseUrl}/api/ProgConfigs/Programme/${programme2}/${bookletSize2}`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });
//         if (!progconfigforjumble.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await progconfigforjumble.json();
//         setPaperData(data);
//         setCopies(data[0].sets.toString());
//         setIterations(data[0].numberofJumblingSteps.toString());
//         setPcid(data[0].progConfigID);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError('An error occurred while fetching data. Please try again later.');
//       }
//     };

//     fetchPaperData();
//   }, [selectedPaperData.programmeID, selectedPaperData.bookletSize]);
  
//   useEffect(() => {
//     const fetchStepsData = async () => {
//       try {
//         if (pcid) {
//           const response = await fetch(`${baseUrl}/api/ProgConfigs/${pcid}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
//           if (!response.ok) {
//             throw new Error('Failed to fetch steps data');
//           }
//           const data = await response.json();
//           setStepsData(data.steps);
//         }
//       } catch (error) {
//         console.error('Error fetching steps data:', error);
//       }
//     };

//     fetchStepsData();
//   }, [pcid, keygenUser]);
  
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     const setofsteps = [];
//     try {
//       const formData = {
//         iterations: parseInt(paperData.paperConfig.numberofJumblingSteps),
//         copies: parseInt(paperData.paperConfig.sets),
//         setofSteps: paperData.steps.map(step => step.split(',').map(s => s.trim())),
//         groupID: selectedPaperData.groupID,
//         subjectID: selectedPaperData.subjectID,
//         paperCode: selectedPaperData.paperCode,
//         catchNumber: selectedPaperData.catchNumber,
//         setID: 1,
//       };
//       console.log(formData)



//       const url = `${baseUrl}/api/FormData/GenerateKey`;

//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${keygenUser?.token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         console.log('Data sent successfully!');

//         const updatedResponseData = {
//           ...responseData,
//           groupID: selectedPaperData.groupID,
//           sessionID: selectedPaperData.sessionID,
//           bookletSize: selectedPaperData.bookletSize,
//           examType: selectedPaperData.examType
//         };
      
//         localStorage.setItem('generatedKeys', JSON.stringify(updatedResponseData));

//         navigate('/KeyGenerator/download-keys');
//       } else {
//         throw new Error('Failed to send data.');
//       }
//     } catch (error) {
//       console.error('Error sending data:', error);
//       setError('An error occurred while sending data. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderSetOfStepsFields = () => {
//     const fields = [];
    
//     const fetchsteps = fetch(`${baseUrl}/api/ProgConfigs/${pcid}`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });;
//     console.log(fetchsteps)
//     for (let i = 0; i < paperData?.steps?.length; i++) {
//       const step = paperData.steps[i];
//       const steps = step.split(',').map(value => value.trim());
//       const stepField = (
//         <Form.Group key={i} className='mt-2'>
//           <Form.Label>{`Set of Steps ${i + 1}: (Ex. 10,20)`}</Form.Label>
//           <Form.Control
//             type="text"
//             placeholder={`Enter set of steps ${i + 1}`}
//             defaultValue={steps.join(',')}
//             disabled
//           />
//         </Form.Group>
//       );
//       fields.push(stepField);
//     }
//     return fields;
//   };

//   return (
//     <Container className="userform border border-3 p-4 my-3">
//       <h3 className='text-center'>Jumbling Steps <hr /></h3>
//       <Form onSubmit={handleSubmit}>
//         <Form.Group className='mt-2'>
//           <Form.Label>No. Of Copies:</Form.Label>
//           <Form.Control
//             type="number"
//             placeholder="Enter copies"
//             value={copies}
//             onChange={(e) => setCopies(e.target.value)}
//             disabled
//           />
//         </Form.Group>

//         <Form.Group className='mt-2'>
//           <Form.Label>No. of Jumbling Iterations:</Form.Label>
//           <Form.Control
//             type="number"
//             placeholder="Enter iterations"
//             value={iterations}
//             onChange={(e) => setIterations(e.target.value)}
//             disabled
//           />
//         </Form.Group>

//         {renderSetOfStepsFields()}

//         {error && <Alert variant="danger" className='mt-3'>{error}</Alert>}

//         <div className="text-center">
//           <Button type="submit" className='mt-3' disabled={loading}>
//             {loading ? <Spinner animation="border" size="sm" /> : 'Generate Keys'}
//           </Button>
//         </div>
//       </Form>
//     </Container>
//   );
// };

// ShuffleConfig.propTypes = {
//   selectedPaperData: PropTypes.object.isRequired,
// };

// export default ShuffleConfig;


import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useUser } from './../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const ShuffleConfig = ({ selectedPaperData }) => {
  const { keygenUser } = useUser();
  const [paperData, setPaperData] = useState({});
  const [iterations, setIterations] = useState('');
  const [copies, setCopies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pcid, setPcid] = useState();
  const [stepsData, setStepsData] = useState([]);
  const navigate = useNavigate();
  console.log(selectedPaperData)

  useEffect(() => {
    const fetchPaperData = async () => {
      try {
        const programme2 = selectedPaperData.programmeID;
        const bookletSize2 = selectedPaperData.bookletSize;

        const progconfigforjumble = await fetch(`${baseUrl}/api/ProgConfigs/Programme/${programme2}/${bookletSize2}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        if (!progconfigforjumble.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await progconfigforjumble.json();
        setPaperData(data);
        setCopies(data[0].sets.toString());
        setIterations(data[0].numberofJumblingSteps.toString());
        setPcid(data[0].progConfigID);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data. Please try again later.');
      }
    };

    fetchPaperData();
  }, [selectedPaperData.programmeID, selectedPaperData.bookletSize]);

  useEffect(() => {
    const fetchStepsData = async () => {
      try {
        if (pcid) {
          const response = await fetch(`${baseUrl}/api/ProgConfigs/${pcid}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          if (!response.ok) {
            throw new Error('Failed to fetch steps data');
          }
          const data = await response.json();
          setStepsData(data.steps);
        }
      } catch (error) {
        console.error('Error fetching steps data:', error);
      }
    };

    fetchStepsData();
  }, [pcid, keygenUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = {
        iterations: parseInt(iterations),
        copies: parseInt(copies),
        setofSteps: stepsData.map(step => step.split(',').map(s => s.trim())),
        progID: selectedPaperData.programmeID,
        paperID: selectedPaperData.paperID,
        catchNumber: selectedPaperData.catchNumber,
        setID: 1,
      };

      const url = `${baseUrl}/api/FormData/GenerateKey`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responseData = await response.json();

        const updatedResponseData = {
          ...responseData,
          progConfigID: pcid
        };
      
        localStorage.setItem('generatedKeys', JSON.stringify(updatedResponseData));

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
    return stepsData.map((step, index) => (
      <Form.Group key={index} className='mt-2'>
        <Form.Label>{`Set of Steps ${index + 1}: (Ex. 10,20)`}</Form.Label>
        <Form.Control
          type="text"
          placeholder={`Enter set of steps ${index + 1}`}
          defaultValue={step.split(',').map(value => value.trim()).join(',')}
          disabled
        />
      </Form.Group>
    ));
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
