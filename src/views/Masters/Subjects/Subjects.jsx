import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Placeholder, Spinner } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
import $ from 'jquery';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Subjects = () => {
    const { keygenUser } = useUser();
    const token = keygenUser?.token;
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjectName, setSubjectName] = useState('');
    const [existingSubjects, setExistingSubjects] = useState([]);
    const [addingSubject, setAddingSubject] = useState(false);

    const tableRef = useRef(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (!loading && tableRef.current) {
            $(tableRef.current).DataTable();
        }
    }, [loading]);

    const fetchSubjects = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/Subjects`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                setSubjects(response.data);
                setLoading(false);
                const existing = response.data.map(subject => subject.subjectName.toLowerCase());
                setExistingSubjects(existing);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleAddSubject = async () => {
        try {
            setAddingSubject(true);
            const response = await axios.post(`${baseUrl}/api/Subjects`, { subjectName }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setSubjectName('');
                setExistingSubjects([...existingSubjects, subjectName.toLowerCase()]);
                fetchSubjects();
            }
        } catch (error) {
            console.error('Error adding subject:', error);
        } finally {
            setAddingSubject(false);
        }
    };

    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-md-6 mb-3">
                    <Card>
                        <Card.Header>
                            <Card.Title className="text-center">Subjects</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="d-flex flex-wrap">
                                    {Array.from({ length: 20 }).map((_, index) => (
                                        <div key={index} className="p-1" style={{ flexBasis: '50%', maxWidth: '50%' }}>
                                            <Placeholder as="div" animation="glow">
                                                <Placeholder xs={12} className='p-3' />
                                            </Placeholder>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Table striped bordered hover ref={tableRef}>
                                    <thead>
                                        <tr>
                                            <th>Subject ID</th>
                                            <th>Subject Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subjects.map((subject) => (
                                            <tr key={subject.subjectID}>
                                                <td>{subject.subjectID}</td>
                                                <td>{subject.subjectName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-6">
                    <Card>
                        <Card.Header>
                            <Card.Title>
                                Add Subject
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <h5 className="card-title"></h5>
                            <Form>
                                <Form.Group controlId="formSubject">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter subject name"
                                        value={subjectName}
                                        onChange={(e) => setSubjectName(e.target.value)}
                                    />
                                </Form.Group>
                                <div className='mt-4 text-end'>
                                    <Button variant="primary" onClick={handleAddSubject} disabled={addingSubject || existingSubjects.includes(subjectName.toLowerCase())}>
                                        {addingSubject ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                Adding Subject...
                                            </>
                                        ) : 'Add Subject'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card> 
                     
                </div>
            </div>
        </div>
    );
};

export default Subjects;
