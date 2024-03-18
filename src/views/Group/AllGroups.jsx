// AllGroups.js
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GroupTable from './GroupTable';

const apiUrl = process.env.REACT_APP_API_GROUP;

const AllGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(apiUrl)
            .then((res) => res.json())
            .then((data) => {
                setGroups(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error Fetching data:", err);
                setLoading(false);
            });
    }, []);

    return (
        <Container className="userform border border-3 p-4">
            <Row className=' '>
                <Col className='border border-1'>
                    <div className="d-flex justify-content-between align-items-center m-3">
                        <h3>Groups</h3>
                        <Button as={Link} to="add-Group/" className="btn btn-sm">
                            Add Group
                        </Button>
                    </div>
                    <hr />
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                            </Spinner>
                        </div>
                    ) : (
                        <GroupTable groups={groups} />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AllGroups;
