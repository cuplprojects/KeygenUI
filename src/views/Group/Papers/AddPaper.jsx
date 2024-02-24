import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from './../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import AddProgramModal from './AddProgramModal';
import AddSubjectModal from './AddSubjectModal';
import PaperConfig from './PaperConfig';

const AddPaper = () => {
  const { keygenUser } = useUser();
  const userId = keygenUser?.user_ID;

  const navigate = useNavigate();
  const { groupID, sessionID } = useParams();

  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const [formData, setFormData] = useState({
    paperID: 0,
    paperName: '',
    groupID: groupID || '',
    sessionID: sessionID || '',
    catchNumber: '',
    paperCode: '',
    program: '',
    examCode: '',
    subjectID: '',
    paperNumber: '',
    examDate: '',
    bookletSize: '',
    createdAt: new Date().toISOString(),
    createdBy: userId || ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addProgram = async (programName) => {
    try {
      const response = await fetch('https://localhost:7247/api/Program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ programName })
      });
      if (!response.ok) {
        throw new Error('Failed to add program');
      }
      fetchPrograms();
    } catch (error) {
      console.error('Error adding program:', error);
    }
  };

  const addSubject = async (subjectName) => {
    try {
      const response = await fetch('https://localhost:7247/api/Subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject_Name: subjectName })
      });
      if (!response.ok) {
        throw new Error('Failed to add subject');
      }
      fetchSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7247/api/Papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Failed to add paper');
      }
      navigate('/papers');
    } catch (error) {
      console.error('Error adding paper:', error);
      setError('Failed to add paper. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchSubjects();
  }, []);

  const fetchPrograms = () => {
    fetch('https://localhost:7247/api/Program')
      .then(response => response.json())
      .then(data => setPrograms(data))
      .catch(error => console.error('Error fetching programs:', error));
  };

  const fetchSubjects = () => {
    fetch('https://localhost:7247/api/Subjects')
      .then(response => response.json())
      .then(data => setSubjects(data))
      .catch(error => console.error('Error fetching subjects:', error));
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      <h3>Add Paper</h3>
      <Form onSubmit={handleSubmit}>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='paperName'>
              <Form.Label>Paper Name</Form.Label>
              <Form.Control
                type='text'
                name='paperName'
                value={formData.paperName}
                onChange={(e) => handleChange('paperName', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='catchNumber'>
              <Form.Label>Catch Number</Form.Label>
              <Form.Control
                type='text'
                name='catchNumber'
                value={formData.catchNumber}
                onChange={(e) => handleChange('catchNumber', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='paperCode'>
              <Form.Label>Paper Code</Form.Label>
              <Form.Control
                type='text'
                name='paperCode'
                value={formData.paperCode}
                onChange={(e) => handleChange('paperCode', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='program'>
              <div className='d-flex align-items-center justify-content-between me-2 dropdown-container'>
                <Form.Label>Program</Form.Label>
                <FontAwesomeIcon onClick={() => setShowAddProgramModal(true)} icon={faPlus} />
              </div>
              <AddProgramModal
                show={showAddProgramModal}
                handleClose={() => setShowAddProgramModal(false)}
                addProgram={addProgram}
              />
              <Select
                options={programs.map(program => ({ label: program.programName, value: program.programID }))}
                value={formData.program ? { label: programs.find(p => p.programID === formData.program).programName, value: formData.program } : null}
                onChange={(selectedOption) => handleChange('program', selectedOption ? selectedOption.value : null)} placeholder="Select Program"
                isClearable
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='examCode'>
              <Form.Label>Exam Code</Form.Label>
              <Form.Control
                type='text'
                name='examCode'
                value={formData.examCode}
                onChange={(e) => handleChange('examCode', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='subjectID'>
              <div className='d-flex align-items-center justify-content-between me-2 dropdown-container'>
                <Form.Label>Select Subject</Form.Label>
                <FontAwesomeIcon onClick={() => setShowAddSubjectModal(true)} icon={faPlus} />
              </div>
              <AddSubjectModal
                show={showAddSubjectModal}
                handleClose={() => setShowAddSubjectModal(false)}
                addSubject={addSubject}
              />
              <Select
                options={subjects.map(subject => ({ label: subject.subject_Name, value: subject.subject_Id }))}
                value={formData.subjectID ? { label: subjects.find(s => s.subject_Id === formData.subjectID).subject_Name, value: formData.subjectID } : null}
                onChange={(selectedOption) => handleChange('subjectID', selectedOption? selectedOption.value:null)}
                placeholder="Select Subject"
                isClearable
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='paperNumber'>
              <Form.Label>Paper Number</Form.Label>
              <Form.Control
                type='text'
                name='paperNumber'
                value={formData.paperNumber}
                onChange={(e) => handleChange('paperNumber', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='examDate'>
              <Form.Label>Exam Date</Form.Label>
              <Form.Control
                type='date'
                name='examDate'
                value={formData.examDate}
                onChange={(e) => handleChange('examDate', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='bookletSize'>
              <Form.Label>Booklet Size</Form.Label>
              <Form.Control
                type='text'
                name='bookletSize'
                value={formData.bookletSize}
                onChange={(e) => handleChange('bookletSize', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        {error && <Alert variant='danger'>{error}</Alert>}
        <Button variant='primary' type='submit' disabled={loading}>
          {loading ? 'Adding...' : 'Add Paper'}
        </Button>
      </Form>
      <PaperConfig />
    </Container>
  );
};

export default AddPaper;
