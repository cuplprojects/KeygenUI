import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Form, Button } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Groups = () => {
  const { keygenUser } = useUser();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [existingGroups, setExistingGroups] = useState([]);

  // Fetch groups on component mount and whenever groups state changes
  useEffect(() => {
    fetchGroups();
  }, [groups]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Groups`, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
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

  const handleUpdateGroup = async (groupId, updatedGroup) => {
    try {
      const response = await axios.put(`${baseUrl}/api/Groups/${groupId}`, updatedGroup, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });
      if (response.status === 204) {
        // Update the groups state to trigger a re-render
        setGroups(groups.map(group => group.groupID === groupId ? updatedGroup : group));
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleAddGroup = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/Groups`, { groupName }, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` },
      });
      if (response.status === 201) {
        setGroupName('');
        setExistingGroups([...existingGroups, groupName.toLowerCase()]); // Clear the input field
      } else {
        // Handle potential API errors here (e.g., display error message to user)
        console.error('Group creation failed:', response);
      }
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

    return (
        <div className="container mt-3">
            <div className="row">
                <div className="col-md-6">
                    <Card>
                        <Card.Header>
                            <Card.Title className="text-center">Groups</Card.Title>
                        </Card.Header>
                        <Card.Body>
                                <Table striped bordered hover>
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
                                                        id={`custom-switch-${group.groupID}`}
                                                        label=""
                                                        checked={group.status}
                                                        onChange={(e) => handleUpdateGroup(group.groupID, { ...group, status: e.target.checked })}
                                                    />
                                                </td>
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
                                <Button variant="primary" onClick={handleAddGroup} disabled={existingGroups.includes(groupName.toLowerCase())}>Add Group</Button>
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
