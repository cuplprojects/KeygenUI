import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Card, CardBody, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PaperComponent = ({ session }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://localhost:7247/api/Papers')
      .then(response => response.json())
      .then(data => {
        const filteredPapers = data.filter(paper => paper.groupID === session.groupID && paper.sessionID === session.session_Id);
        setPapers(filteredPapers);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching papers:', error);
        setLoading(false);
      });
  }, [session.groupID, session.session_Id]);

  const handleViewPaper = (paper) => {
    // Handle the view paper action here
    console.log('Viewing paper:', paper);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='border border-1 p-3'>
      <div className='d-flex align-items-center justify-content-between mb-2'>
        <h3>Papers</h3>
        <Button as={Link} to={`/Groups/AddPaper/?groupID=${session.groupID}&sessionID=${session.session_Id}`}>Add Paper</Button>
      </div>
      <hr />
      <Card className='my-2'>
        <CardBody className='pb-2 text-center'>
          <h6>Session: {session.session_Name}</h6>
        </CardBody>
      </Card>
      {papers.length === 0 ? (
        <Alert variant='info'>No papers found for this session.</Alert>
      ) : (
        <Table bordered hover striped>
          <thead>
            <tr>
              <th>Catch Number</th>
              <th>Paper Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {papers.map(paper => (
              <tr key={paper.paperID}>
                <td>{paper.catchNumber}</td>
                <td>{paper.paperCode}</td>
                <td>
                  <button className='btn btn-primary' onClick={() => handleViewPaper(paper)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

PaperComponent.propTypes = {
  session: PropTypes.shape({
    session_Name: PropTypes.string.isRequired,
    groupID: PropTypes.number.isRequired,
    sessionID: PropTypes.number.isRequired
  }).isRequired
};

export default PaperComponent;
