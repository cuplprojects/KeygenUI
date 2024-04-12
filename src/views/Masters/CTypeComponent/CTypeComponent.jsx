import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const CTypeComponent = () => {
    const { keygenUser } = useUser();
    const token = keygenUser?.token;
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeName, setTypeName] = useState('');
    const [existingTypes, setExistingTypes] = useState([]);

    useEffect(() => {
        fetchTypes();
    }, []); // Fetch types only once when the component mounts

    const fetchTypes = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/CTypes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data) {
                setTypes(response.data);
                setLoading(false);
                const existing = response.data.map(type => type.typeName.toLowerCase());
                setExistingTypes(existing);
            }
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    const handleAddType = async () => {
        try {
            const response = await axios.post(`${baseUrl}/api/Types`, { typeName }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setTypeName(''); // Clear the input field
            }
        } catch (error) {
            console.error('Error adding type:', error);
        }
    };

    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-md-6 mb-3">
                    <Card>
                        <Card.Header>
                            <Card.Title className="text-center">Types</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Type ID</th>
                                        <th>Type Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {types.map((type) => (
                                        <tr key={type.typeID}>
                                            <td>{type.typeID}</td>
                                            <td>{type.typeName}</td>
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
                                Add Type
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <h5 className="card-title"></h5>
                            <Form>
                                <Form.Group controlId="formType">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter type name"
                                        value={typeName}
                                        onChange={(e) => setTypeName(e.target.value)}
                                    />
                                </Form.Group>
                                <div className='mt-4 text-end'>
                                    <Button variant="primary" onClick={handleAddType} disabled={existingTypes.includes(typeName.toLowerCase()) || !typeName.trim()}>Add Type</Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CTypeComponent;
