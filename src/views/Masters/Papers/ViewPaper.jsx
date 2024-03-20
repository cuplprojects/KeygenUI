import React, { useState, useEffect } from 'react';
import { Form, Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useSecurity } from './../../../context/Security';

const ViewPaper = () => {
  const { decrypt } = useSecurity();
  const { paperID } = useParams();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [group, setGroup] = useState(null);
  const [session, setSession] = useState(null);

  const handleChange = (name, value) => {
    setPaper({
      ...paper,
      [name]: value
    });
  };

  const fetchPaper = () => {
    fetch(`http://api2.chandrakala.co.in/api/Papers/${decrypt(paperID)}`)
      .then(response => response.json())
      .then(data => {
        setPaper(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching paper:', error);
        setLoading(false);
      });
  };

  const fetchPrograms = () => {
    fetch('http://api2.chandrakala.co.in/api/Program')
      .then(response => response.json())
      .then(data => {
        setPrograms(data);
      })
      .catch(error => {
        console.error('Error fetching programs:', error);
      });
  };

  const fetchSubjects = () => {
    fetch('http://api2.chandrakala.co.in/api/Subjects')
      .then(response => response.json())
      .then(data => {
        setSubjects(data);
      })
      .catch(error => {
        console.error('Error fetching subjects:', error);
      });
  };

  const fetchGroup = () => {
    fetch('http://api2.chandrakala.co.in/api/Group')
      .then(response => response.json())
      .then(data => {
        const groupData = data.find(group => group.groupID === paper.groupID);
        setGroup(groupData);
        console.log(groupData)
      })
      .catch(error => {
        console.error('Error fetching group:', error);
      });
  };

  const fetchSession = () => {
    fetch('http://api2.chandrakala.co.in/api/Sessions')
      .then(response => response.json())
      .then(data => {
        const sessionData = data.find(session => session.session_Id === paper.sessionID);
        setSession(sessionData);
      })
      .catch(error => {
        console.error('Error fetching session:', error);
      });
  };

  useEffect(() => {
    fetchPaper();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paper) {
      fetchGroup();
      fetchSession();
      fetchPrograms();
      fetchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Container className="userform border border-3 p-4 my-3">

      <div className="d-flex justify-content-between m-3">
        <h3>View Paper</h3>
        {group && session && (
          <>
            <div><h5>Group Name: {group.groupName}</h5></div>
            <div><h5>Session: {session.session_Name}</h5></div>
          </>
        )}
      </div>
      <hr />
      {loading && <div>Loading...</div>}

      {paper && (
        <Form>
          <Row className='mb-3'>
            <Col>
              <Form.Group controlId='paperName'>
                <Form.Label>Paper Name</Form.Label>
                <Form.Control
                  type='text'
                  name='paperName'
                  value={paper.paperName}
                  onChange={(e) => handleChange('paperName', e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='catchNumber'>
                <Form.Label>Catch Number</Form.Label>
                <Form.Control
                  type='text'
                  name='catchNumber'
                  value={paper.catchNumber}
                  onChange={(e) => handleChange('catchNumber', e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='paperCode'>
                <Form.Label>Paper Code</Form.Label>
                <Form.Control
                  type='text'
                  name='paperCode'
                  value={paper.paperCode}
                  onChange={(e) => handleChange('paperCode', e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className='mb-3'>
            <Col>
              <Form.Group controlId='program'>
                <Form.Label>Program</Form.Label>
                <Form.Control
                  as='select'
                  name='program'
                  value={paper.programID}
                  onChange={(e) => handleChange('program', e.target.value)}
                  disabled
                >
                  {programs.map(program => (
                    <option key={program.programID} value={program.programID}>
                      {program.programName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='examCode'>
                <Form.Label>Exam Code</Form.Label>
                <Form.Control
                  type='text'
                  name='examCode'
                  value={paper.examCode}
                  onChange={(e) => handleChange('examCode', e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='subjectID'>
                <Form.Label>Subject ID</Form.Label>
                <Form.Control
                  as='select'
                  name='subjectID'
                  value={paper.subjectID}
                  onChange={(e) => handleChange('subjectID', e.target.value)}
                  disabled
                >
                  {subjects.map(subject => (
                    <option key={subject.subject_Id} value={subject.subject_Id}>
                      {subject.subject_Name}
                    </option>
                  ))}
                </Form.Control>
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
                  value={paper.paperNumber}
                  onChange={(e) => handleChange('paperNumber', e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
            <Col>
            <Form.Group controlId='examDate'>
    <Form.Label>Exam Date</Form.Label>
    <Form.Control
      type='text'
      name='examDate'
      value={formatDate(paper.examDate)}
      onChange={(e) => handleChange('examDate', e.target.value)}
      disabled
    />
  </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='bookletSize'>
                <Form.Label>Booklet Size</Form.Label>
                <Form.Control
                  type='text'
                  name='bookletSize'
                  value={paper.bookletSize}
                  onChange={(e) => handleChange('bookletSize', e.target.value)}
                  disabled
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      )}
    </Container>
  );
};

export default ViewPaper;
