import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import PaperComponent from './PaperComponent';
import { useSecurity } from './../../context/Security';
const baseUrl = process.env.REACT_APP_BASE_URL;
const ViewGroup = () => {
  const { decrypt } = useSecurity();

  const { groupID } = useParams();
  const groupId = decrypt(groupID);
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    fetch(`${baseUrl}/api/Group/${groupId}`)
      .then(response => response.json())
      .then(data => {
        setGroup(data);
        setLoadingGroup(false);
      })
      .catch(error => {
        console.error('Error fetching group:', error);
        setLoadingGroup(false);
      });
  }, [groupId]);

  return (
    <Row>
      <Col md={6}>
        <Card>
          <Card.Header className='d-flex align-items-center justify-content-between'>
            <h4>Group Details</h4>
            {/* <Link to={`/Groups/EditGroup/${groupID}`} className="btn btn-primary">
              Edit Group
            </Link> */}
          </Card.Header>
          <Card.Body>
            {loadingGroup ? (
              <p>Loading group details...</p>
            ) : group ? (
              <>
                <h5>Group Name: {group.groupName}</h5>
                <p><strong>Region:</strong> {group.region}</p>
                <p><strong>City:</strong> {group.city}</p>
                <p><strong>Address:</strong> {group.address}</p>
              </>
            ) : (
              <Alert variant="danger">Group details not found.</Alert>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <PaperComponent groupId={groupId} />
      </Col>
    </Row>
  );
};

export default ViewGroup;
