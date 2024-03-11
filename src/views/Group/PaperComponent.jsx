// PaperComponent.js
import React, { useEffect, useState } from 'react';
import { Table, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

const PaperComponent = () => {
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState('');
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://api2.chandrakala.co.in/api/Group/${groupId}`)
      .then(response => response.json())
      .then(data => {
        setGroupName(data.groupName);
      })
      .catch(error => {
        console.error('Error fetching group name:', error);
      });

    fetch(`http://api2.chandrakala.co.in/api/Papers?groupId=${groupId}`)
      .then(response => response.json())
      .then(data => {
        setPapers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching papers:', error);
        setLoading(false);
      });
  }, [groupId]);

  return (
    <div className='border border-1 p-3'>
      <div className='d-flex align-items-center justify-content-between mb-2'>
        <h4>Papers</h4>
        <h4 className='text-center'>Group: {groupName}</h4>
        <Link to={`/Groups/AddPaper/${groupId}`} className='btn btn-primary'>
          Add New Paper
        </Link>
      </div>
      <hr />
      <Table bordered hover striped>
        <thead>
          <tr>
            <th>Catch Number</th>
            <th>Paper Code</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3">
                <div className="text-center">Loading...</div>
              </td>
            </tr>
          ) : papers.length === 0 ? (
            <tr>
              <td colSpan="3">
                <Alert variant='info'>No papers found for this session.</Alert>
              </td>
            </tr>
          ) : (
            papers.map(paper => (
              <tr key={paper.paperID}>
                <td>{paper.catchNumber}</td>
                <td>{paper.paperCode}</td>
                <td>
                  <Link to={`/Groups/ViewPaper/${paper.paperID}`} className='btn btn-primary'>View</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PaperComponent;
