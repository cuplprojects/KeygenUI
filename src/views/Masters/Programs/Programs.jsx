import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button } from 'react-bootstrap';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Programs = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [programName, setProgramName] = useState('');
    const [existingPrograms, setExistingPrograms] = useState([]);

    useEffect(() => {
        fetchPrograms();
    }, [programs]); // Fetch programs whenever there's a change in the programs state

    const fetchPrograms = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/Program`);
            if (response.data) {
                setPrograms(response.data);
                setLoading(false);
                const existing = response.data.map(program => program.programName.toLowerCase());
                setExistingPrograms(existing);
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
        }
    };

    const handleAddProgram = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/Program`, { programName });
            if (response.status === 200) {
                setProgramName(''); // Clear the input field
            }
        } catch (error) {
            console.error('Error adding program:', error);
        }
    };

    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-md-6">
                    <Card>
                        <Card.Header>
                            <Card.Title className="text-center">Programs</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Program ID</th>
                                            <th>Program Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {programs.map((program) => (
                                            <tr key={program.programID}>
                                                <td>{program.programID}</td>
                                                <td>{program.programName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-6">
                    <Card>
                        <Card.Header>
                            <Card.Title>
                                Add Program
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <h5 className="card-title"></h5>
                            <Form>
                                <Form.Group controlId="formProgram">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter program name"
                                        value={programName}
                                        onChange={(e) => setProgramName(e.target.value)}
                                    />
                                </Form.Group>
                                <div className='mt-4 text-end'>
                                    <Button variant="primary" onClick={handleAddProgram} disabled={existingPrograms.includes(programName) || !programName.trim()}>Add Program</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Programs;
