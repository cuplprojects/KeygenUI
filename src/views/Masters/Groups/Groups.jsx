import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button, Spinner, Placeholder } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
import $ from 'jquery';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Groups = () => {
  const { keygenUser } = useUser();
  const token = keygenUser?.token
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [existingGroups, setExistingGroups] = useState([]);
  const [addingGroup, setAddingGroup] = useState(false);

  const tableRef = useRef(null);

  useEffect(() => {
    fetchGroups();
  }, []); // Fetch groups on initial render

  useEffect(() => {
    if (!loading && tableRef.current) {
      $(tableRef.current).DataTable();
    }
  }, [loading]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Groups`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data) {
        setGroups(response.data);
        setLoading(false);
        const existing = response.data.map(group => group.groupName.toLowerCase());
        setExistingGroups(existing);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleToggleStatus = async (groupId, groupName, newStatus) => {
    try {
      const response = await axios.put(`${baseUrl}/api/Groups/${groupId}`, { groupId, groupName, status: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 204) {
        setGroups(groups.map(group => group.groupID === groupId ? { ...group, status: newStatus } : group));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleAddGroup = async () => {
    try {
      setAddingGroup(true);
      const response = await axios.post(`${baseUrl}/api/Groups`, { groupName, status: true }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setGroupName('');
        fetchGroups(); // Fetch updated groups
      }
    } catch (error) {
      console.error('Error adding group:', error);
    } finally {
      setAddingGroup(false); // Stop loading spinner
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col-md-6 mb-3">
          <Card>
            <Card.Header>
              <Card.Title className="text-center">Groups</Card.Title>
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
                <Table id="groupsTable" striped bordered hover ref={tableRef}>
                  <thead>
                    <tr>
                      <th>Group ID</th>
                      <th>Group Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <tr key={group.groupID}>
                        <td>{group.groupID}</td>
                        <td>{group.groupName}</td>
                        <td>
                          <Form.Check
                            type="switch"
                            id={`status-switch-${group.groupID}`}
                            label=""
                            checked={group.status}
                            onChange={(e) => handleToggleStatus(group.groupID, group.groupName, e.target.checked)}
                          />
                        </td>
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
                Add Group
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <h5 className="card-title"></h5>
              <Form>
                <Form.Group controlId="formGroup">
                  <Form.Control
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </Form.Group>
                <div className='mt-4 text-end'>
                  <Button variant="primary" onClick={handleAddGroup} disabled={addingGroup || existingGroups.includes(groupName.toLowerCase()) || !groupName.trim()}>
                    {addingGroup ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        Adding Group...
                      </>
                    ) : 'Add Group'}
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

export default Groups;
