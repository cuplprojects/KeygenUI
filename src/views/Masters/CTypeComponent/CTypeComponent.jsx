import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Spinner, Placeholder } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
import $ from 'jquery';
const baseUrl = process.env.REACT_APP_BASE_URL;

const CTypeComponent = () => {
    const { keygenUser } = useUser();
    const token = keygenUser?.token;
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeName, setTypeName] = useState('');
    const [existingTypes, setExistingTypes] = useState([]);
    const tableRef = useRef(null);

    useEffect(() => {
        fetchTypes();
    }, []); // Fetch types only once when the component mounts

    useEffect(() => {
        if (!loading && tableRef.current) {
            $(tableRef.current).DataTable();
        }
    }, [loading]);

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
            const response = await axios.post(`${baseUrl}/api/CTypes`, { typeName }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status >= 200 && response.status < 300) {
                setTypes([...types, response.data]); // Update types state with the new type
                setTypeName(''); // Clear the input field
            } else {
                console.error('Failed to add type:', response);
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
                            )}
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
