import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { useUser } from '../../../context/UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AddProgramModal from './AddProgramModal';
import AddSubjectModal from './AddSubjectModal';
import axios from 'axios';
import ImportData from './ImportData';
const baseUrl = process.env.REACT_APP_BASE_URL;

const AddPaper = () => {
  const { keygenUser } = useUser();
  const userId = keygenUser?.userID;

  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selecedfile, setSelecedfile] = useState(false);
  const [formData, setFormData] = useState({
    paperID: 0,
    programmeID: 0,
    paperName: '',
    catchNumber: '',
    paperCode: '',
    courseID: '',
    examType: '',
    subjectID: '',
    paperNumber: '',
    examDate: '',
    bookletSize: 0,
    createdAt: new Date().toISOString(),
    createdByID: userId || '',
    KeyGenerated: false
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (!formData.catchNumber) {
      return;
    }
    e.preventDefault();
    setLoading(true);
    console.log(formData);
    // Add new paper
    try {
      const addResponse = await axios.post(`${baseUrl}/api/Papers`, formData, {
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        }
      });
      setSuccess('Paper added successfully');
      setFormData({
        paperID: 0,
        programmeID: 0,
        paperName: '',
        catchNumber: '',
        paperCode: '',
        courseID: '',
        examType: '',
        subjectID: '',
        paperNumber: '',
        examDate: '',
        bookletSize: 0,
        createdAt: new Date().toISOString(),
        createdByID: userId || '',
        KeyGenerated: false
      });
      setLoading(false);
    } catch (error) {
      console.error('Error adding paper:', error);
      setError('Failed to add paper. Please try again.');
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPrograms();
    fetchSubjects();
    fetchCourses();
  }, []);

  const fetchPrograms = () => {
    fetch(`${baseUrl}/api/Programmes`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => response.json())
      .then(data => setPrograms(data))
      .catch(error => console.error('Error fetching programs:', error));
  };

  const fetchSubjects = () => {
    fetch(`${baseUrl}/api/Subjects`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => response.json())
      .then(data => {
        setSubjects(data)
      })
      .catch(error => console.error('Error fetching subjects:', error));
  };
  const fetchCourses = () => {
    fetch(`${baseUrl}/api/Courses`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  };
  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <Container className="userform border border-3 p-4 my-3 mt-0">
      <div className="d-flex justify-content-between align-items-center">
        <h3>Add Paper</h3>

      </div>

      <Form onSubmit={handleSubmit}>
        <Row className='mb-3'>
          <Col>
            <Form.Group controlId='programmeID'>
              <Form.Label>Program<span className='text-danger'>*</span></Form.Label>
              <Select
                options={programs.map(program => ({ label: program.programmeName, value: program.programmeID }))}
                value={formData.programmeID ? { label: programs.find(p => p.programmeID === formData.programmeID).programmeName, value: formData.programmeID } : null}
                onChange={(selectedOption) => handleChange('programmeID', selectedOption ? selectedOption.value : null)}
                placeholder="Select Program"
                isClearable
                required
              />
            </Form.Group>
          </Col>
          {/* Booklet size  */}
          <Col>
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
        </Row>

        {/* bulk import  */}
        <ImportData
          programmeID={formData.programmeID}
          setSelecedfile={setSelecedfile}
          bookletSize={formData.bookletSize ? parseInt(formData.bookletSize, 10) : 0}
        />

        {
          !selecedfile && (
            <>
              {/* Show field only when bulk import is not */}
              {/* other data */}
              <Row className='row-cols-1 row-cols-sm-2 row-cols-md-3'>
                {/* catch no */}
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
                {/* course  */}
                <Col>
                  <Form.Group controlId='courseID'>
                    <Form.Label>Course<span className='text-danger'>*</span></Form.Label>
                    <Select
                      options={courses.map(course => ({ label: course.courseName, value: course.courseID }))}
                      value={formData.courseID ? { label: courses.find(c => c.courseID === formData.courseID).courseName, value: formData.courseID } : null}
                      onChange={(selectedOption) => handleChange('courseID', selectedOption ? selectedOption.value : null)}
                      placeholder="Select Course"
                      isClearable
                      required
                    />
                  </Form.Group>
                </Col>
                {/* exam type  */}
                <Col>
                  <Form.Group controlId='examType'>
                    <Form.Label>Exam Type<span className='text-danger'>*</span></Form.Label>
                    <Form.Control
                      type='text'
                      name='examType'
                      value={formData.examType}
                      onChange={(e) => handleChange('examType', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                {/* subject  */}
                <Col>
                  <Form.Group controlId='subjectID'>
                    <Form.Label>Subject ID<span className='text-danger'>*</span></Form.Label>
                    <Select
                      options={subjects.map(subject => ({ label: subject.subjectName, value: subject.subjectID }))}
                      value={formData.subjectID ? { label: subjects.find(s => s.subjectID === formData.subjectID).subjectName, value: formData.subjectID } : null}
                      onChange={(selectedOption) => handleChange('subjectID', selectedOption ? selectedOption.value : null)}
                      placeholder="Select Subject"
                      isClearable
                      required
                    />
                  </Form.Group>
                </Col>
                {/* paper name  */}
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
                {/* paper number  */}
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
                {/* exam date  */}
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


              {error && <Alert variant='danger'>{error}</Alert>}
              {success && <Alert variant='success'>{success}</Alert>}
              <br />

              <Button variant='primary' type='submit' disabled={loading}>
                {loading ? 'Adding...' : 'Add Paper'}
              </Button>
            </>
          )
        }

      </Form>
    </Container>
  );
};

export default AddPaper;
