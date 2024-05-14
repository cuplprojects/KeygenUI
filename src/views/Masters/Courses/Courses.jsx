import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Spinner, Placeholder } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
import $ from 'jquery';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Courses = () => {
    const { keygenUser } = useUser();
    const token = keygenUser?.token
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseName, setCourseName] = useState('');
    const [existingCourses, setExistingCourses] = useState([]);
    const [addingCourse, setAddingCourse] = useState(false);

    const tableRef = useRef(null);

    useEffect(() => {
        fetchCourses();
    }, []); // Fetch courses on initial render

    useEffect(() => {
        if (!loading && tableRef.current) {
            $(tableRef.current).DataTable();
        }
    }, [loading]);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/Courses`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                setCourses(response.data);
                setLoading(false);
                const existing = response.data.map(course => course.courseName.toLowerCase());
                setExistingCourses(existing);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleAddCourse = async () => {
        try {
            setAddingCourse(true);
            const response = await axios.post(`${baseUrl}/api/Courses`, { courseName }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setCourseName('');
                fetchCourses(); // Fetch updated courses
            }
        } catch (error) {
            console.error('Error adding course:', error);
        } finally {
            setAddingCourse(false); // Stop loading spinner
        }
    };

    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-md-6 mb-3">
                    <Card>
                        <Card.Header>
                            <Card.Title className="text-center">Courses</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <>
                                    <div className="d-flex flex-wrap">
                                        {Array.from({ length: 20 }).map((_, index) => (
                                            <div key={index} className="p-1" style={{ flexBasis: '50%', maxWidth: '50%' }}>
                                                <Placeholder as="div" animation="glow">
                                                    <Placeholder xs={12} className='p-3' />
                                                </Placeholder>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Table striped bordered hover ref={tableRef}>
                                    <thead>
                                        <tr>
                                            <th>Course ID</th>
                                            <th>Course Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map((course) => (
                                            <tr key={course.courseID}>
                                                <td>{course.courseID}</td>
                                                <td>{course.courseName}</td>
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
                                Add Course
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <h5 className="card-title"></h5>
                            <Form>
                                <Form.Group controlId="formCourse">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter course name"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                    />
                                </Form.Group>
                                <div className='mt-4 text-end'>
                                    <Button variant="primary" onClick={handleAddCourse} disabled={addingCourse || existingCourses.includes(courseName.toLowerCase()) || !courseName.trim()}>
                                        {addingCourse ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                Adding Course...
                                            </>
                                        ) : 'Add Course'}
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


export default Courses;
