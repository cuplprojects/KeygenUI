import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Courses = () => {
    const { keygenUser } = useUser();
    const token = keygenUser?.token
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseName, setCourseName] = useState('');
    const [existingCourses, setExistingCourses] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, [courses]); // Fetch courses whenever there's a change in the courses state

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/Courses`,{
                headers:{
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
            const response = await axios.post(`${baseUrl}/api/Courses`, { courseName },{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setCourseName(''); // Clear the input field
            }
        } catch (error) {
            console.error('Error adding course:', error);
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
                                <Table striped bordered hover>
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
                                    <Button variant="primary" onClick={handleAddCourse} disabled={existingCourses.includes(courseName.toLowerCase()) || !courseName.trim()}>Add Course</Button>
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
