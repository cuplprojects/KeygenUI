import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import AddProgramModal from './AddProgramModal';
import AddSubjectModal from './AddSubjectModal';

const AddPaper = () => {
  const { keygenUser } = useUser();
  const userId = keygenUser?.user_ID;

  const { groupID } = useParams();

  const [groups, setGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [paperConfigData, setPaperConfigData] = useState(null);
  const [formData, setFormData] = useState({
    paperID: 0,
    sessionID: '',
    groupID: '',
    catchNumber: '',
    paperName: '',
    paperCode: '',
    programID: '',
    examCode: '',
    subjectID: '',
    paperNumber: '',
    examDate: '',
    bookletSize: '',
    createdAt: new Date().toISOString(),
    createdBy: userId || ''
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);


  const handleChange = async (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'bookletSize') {
      try {
        const response = await fetch(`http://api2.chandrakala.co.in/api/PaperConfig/Group/Session?groupID=${groupID}&sessionID=${formData.sessionID}&bookletsize=${value}`);
        if (!response.ok) {
          throw new Error('Failed to fetch paper config');
        }
        const paperConfigData = await response.json();
        setPaperConfigData(paperConfigData);
      } catch (error) {
        console.error('Error fetching paper config:', error);
        setPaperConfigData(null);
      }
    }
  };

  const addProgram = async (programName) => {
    try {
      const response = await fetch('http://api2.chandrakala.co.in/api/Program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ programName })
      });
      if (!response.ok) {
        throw new Error('Failed to add program');
      }
      const newProgram = await response.json();
      setPrograms([...programs, newProgram]);
      handleChange('programID', newProgram.programID);
    } catch (error) {
      console.error('Error adding program:', error);
    }
  };

  const addSubject = async (subjectName) => {
    try {
      const response = await fetch('http://api2.chandrakala.co.in/api/Subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject_Name: subjectName })
      });
      if (!response.ok) {
        throw new Error('Failed to add subject');
      }
      const newSubject = await response.json();
      setSubjects([...subjects, newSubject]);
      handleChange('subjectID', newSubject.subject_Id);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Fetch existing papers
      const response = await fetch('http://api2.chandrakala.co.in/api/Papers');
      if (!response.ok) {
        throw new Error('Failed to fetch papers');
      }
      const papers = await response.json(); // Check for duplicate
      const isDuplicate = papers.some(paper =>
        paper.catchNumber.toLowerCase() === formData.catchNumber.toLowerCase() &&
        parseInt(paper.groupID) === parseInt(formData.groupID) &&
        parseInt(paper.sessionID) === parseInt(formData.sessionID) &&
        parseInt(paper.subjectID) === parseInt(formData.subjectID)
      );
      if (isDuplicate) {
        setError('Duplicate paper. Please check the details.');
        setLoading(false);
        return;
      }

      // Add new paper
      const addResponse = await fetch('http://api2.chandrakala.co.in/api/Papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!addResponse.ok) {
        throw new Error('Failed to add paper');
      }
      setSuccess('Paper added successfully');
      setFormData({
        ...formData,
        catchNumber: '',
        paperName: '',
        paperCode: '',
        examCode: '',
        subjectID: '',
        paperNumber: '',
        examDate: '',
        bookletSize: '',
      });
      setPaperConfigData(null);
      setLoading(false);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error adding paper:', error);
      setError('Failed to add paper. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchSubjects();
    fetchSessions();
    fetchGroups();
  }, []);

  const fetchPrograms = () => {
    fetch('http://api2.chandrakala.co.in/api/Program')
      .then(response => response.json())
      .then(data => setPrograms(data))
      .catch(error => console.error('Error fetching programs:', error));
  };

  const fetchGroups = () => {
    fetch('http://api2.chandrakala.co.in/api/Group')
      .then(response => response.json())
      .then(data => setGroups(data))
      .catch(error => console.error('Error fetching Groups:', error));
  };

  const fetchSubjects = () => {
    fetch('http://api2.chandrakala.co.in/api/Subjects')
      .then(response => response.json())
      .then(data => setSubjects(data))
      .catch(error => console.error('Error fetching subjects:', error));
  };

  const fetchSessions = () => {
    fetch('http://api2.chandrakala.co.in/api/Sessions')
      .then(response => response.json())
      .then(data => setSessions(data))
      .catch(error => console.error('Error fetching sessions:', error));
  };


  const handleConfirmation = () => {
    setShowConfirmation(true);
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      <h3>Add Paper</h3>
      <Form onSubmit={handleSubmit}>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='groupID'>
              <Form.Label >Groups<span className='text-danger'>*</span></Form.Label>
              <Select
                options={groups.map(group => ({ label: group.groupName, value: group.groupID }))}
                value={formData.groupID ? { label: groups.find(s => s.groupID === formData.groupID).groupName, value: formData.groupID } : null}
                onChange={(selectedOption) => handleChange('groupID', selectedOption ? selectedOption.value : null)}
                placeholder="Select Group"
                isClearable
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='sessionID'>
              <Form.Label>Session<span className='text-danger'>*</span></Form.Label>
              <Select
                options={sessions.map(session => ({ label: session.session_Name, value: session.session_Id }))}
                value={formData.sessionID ? { label: sessions.find(s => s.session_Id === formData.sessionID).session_Name, value: formData.sessionID } : null}
                onChange={(selectedOption) => handleChange('sessionID', selectedOption ? selectedOption.value : null)}
                placeholder="Select Session"
                isClearable
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='catchNumber'>
              <Form.Label>Catch Number<span className='text-danger'>*</span></Form.Label>
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
            <Form.Group controlId='paperName'>
              <Form.Label>Paper Name<span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type='text'
                name='paperName'
                value={formData.paperName}
                onChange={(e) => handleChange('paperName', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='paperCode'>
              <Form.Label>Paper Code<span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type='text'
                name='paperCode'
                value={formData.paperCode}
                onChange={(e) => handleChange('paperCode', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='program'>
              <div className='d-flex align-items-center justify-content-between me-2 dropdown-container'>
                <Form.Label>Program<span className='text-danger'>*</span></Form.Label>
                <FontAwesomeIcon onClick={() => setShowAddProgramModal(true)} icon={faPlus} />
              </div>
              <AddProgramModal
                show={showAddProgramModal}
                handleClose={() => setShowAddProgramModal(false)}
                addProgram={addProgram}
                programs={programs}
              />
              <Select
                options={programs.map(program => ({ label: program.programName, value: program.programID }))}
                value={formData.programID ? { label: programs.find(p => p.programID === formData.programID).programName, value: formData.programID } : null}
                onChange={(selectedOption) => handleChange('programID', selectedOption ? selectedOption.value : null)} placeholder="Select Program"
                isClearable
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='examCode'>
              <Form.Label>Exam Code<span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type='text'
                name='examCode'
                value={formData.examCode}
                onChange={(e) => handleChange('examCode', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='subjectID'>
              <div className='d-flex align-items-center justify-content-between me-2 dropdown-container'>
                <Form.Label>Select Subject<span className='text-danger'>*</span></Form.Label>
                <FontAwesomeIcon onClick={() => setShowAddSubjectModal(true)} icon={faPlus} />
              </div>
              <AddSubjectModal
                show={showAddSubjectModal}
                handleClose={() => setShowAddSubjectModal(false)}
                addSubject={addSubject}
                subjects={subjects}
              />
              <Select
                options={subjects.map(subject => ({ label: subject.subject_Name, value: subject.subject_Id }))}
                value={formData.subjectID ? { label: subjects.find(s => s.subject_Id === formData.subjectID).subject_Name, value: formData.subjectID } : null}
                onChange={(selectedOption) => handleChange('subjectID', selectedOption ? selectedOption.value : null)}
                placeholder="Select Subject"
                isClearable
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId='paperNumber'>
              <Form.Label>Paper Number<span className='text-danger'>*</span></Form.Label>
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
              <Form.Label>Exam Date<span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type='date'
                name='examDate'
                value={formData.examDate}
                onChange={(e) => handleChange('examDate', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col md={4}>
            <Form.Group controlId='bookletSize'>
              <Form.Label>Booklet Size<span className='text-danger'>*</span></Form.Label>
              <Form.Control
                type='text'
                name='bookletSize'
                value={formData.bookletSize}
                onChange={(e) => handleChange('bookletSize', e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={8}>
            {paperConfigData ? (
              <Card className="my-0">
                <Card.Body>
                  <Row>
                    <Col xs={4}>
                      <p><strong>Number of Questions:</strong> {paperConfigData.paperConfig.numberofQuestions}</p>
                      <p><strong>Sets:</strong> {paperConfigData.paperConfig.sets}</p>
                      <p><strong>Set Order:</strong> {paperConfigData.paperConfig.setOrder}</p>
                    </Col>
                    <Col xs={4}>
                      <p><strong>Number of Questions:</strong> {paperConfigData.paperConfig.numberofQuestions}</p>
                      <p><strong>Sets:</strong> {paperConfigData.paperConfig.sets}</p>
                      <p><strong>Set Order:</strong> {paperConfigData.paperConfig.setOrder}</p>
                    </Col>
                    <Col xs={4}>
                      <p><strong>Number of Jumbling Steps:</strong> {paperConfigData.paperConfig.numberofJumblingSteps}</p>
                      {paperConfigData.steps.map((step, index) => (
                        <p key={index}><strong>Step {index + 1}:</strong> {step}</p>
                      ))}
                    </Col>
                  </Row>
                  <Form.Group controlId='confirmationCheckbox'>
                    <Form.Check
                      type='checkbox'
                      label='Confirm Paper Config Data'
                      onChange={handleConfirmation}
                      checked={showConfirmation}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            ) : (
              <Card className="my-3">
                <Card.Body>
                  <p>No Configuration found for this.</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        <Button variant='primary' type='submit' disabled={loading || !showConfirmation}>
          {loading ? 'Adding...' : 'Add Paper'}
        </Button>
        {error && <Alert variant='danger'>{error}</Alert>}
        {success && <Alert variant='success'>{success}</Alert>}
      </Form>
    </Container>
  );
};

export default AddPaper;
