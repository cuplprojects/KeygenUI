import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GroupTable from './GroupTable';
import GroupSessions from './GroupSessions'; // Import the GroupSessions component
import PaperComponent from './PaperComponent'; // Import the PaperComponent

const AllGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null); // State to store the selected session for PaperComponent

    useEffect(() => {
        fetch("https://localhost:7247/api/Universities")
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

    const onViewGroup = (group) => {
        setSelectedGroup(group);
        setSelectedSession(null); // Reset selected session when selecting a new group
    };

    const onViewSession = (session) => {
        setSelectedSession(session);
    };

    return (
        <Container className="userform border border-3 p-4">
            <Row className=' row-cols-1 row-cols-lg-3'>
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
                        <GroupTable groups={groups} onViewGroup={onViewGroup} />
                    )}
                </Col>
                <Col>
                    {selectedGroup? <GroupSessions group={selectedGroup} onViewSession={onViewSession} />
                    :<div className='border border-1 p-3 text-center'><h3>Select The Group</h3></div>}
                </Col>
                <Col>
                    {selectedSession? <PaperComponent session={selectedSession} />
                    :<div className='border border-1 p-3 text-center'><h3>Select The Session </h3></div>}
                </Col>
            </Row>
        </Container>
    );
};

export default AllGroups;
