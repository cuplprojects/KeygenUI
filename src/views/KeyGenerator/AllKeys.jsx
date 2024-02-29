import React, { useState, useEffect } from "react";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_CHANGE_ANSWERKEYS;

const AllKeys = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://localhost:7247/api/Papers')
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then(async (data) => {
        const updatedPapers = await Promise.all(data.map(async (paper) => {
          const groupResponse = await fetch(`https://localhost:7247/api/Group/${paper.groupID}`);
          const groupData = await groupResponse.json();
          const sessionResponse = await fetch(`https://localhost:7247/api/Sessions/${paper.sessionID}`);
          const sessionData = await sessionResponse.json();
          const subjectResponse = await fetch(`https://localhost:7247/api/Subjects/${paper.subjectID}`);
          const subjectData = await subjectResponse.json();
          return {
            ...paper,
            groupName: groupData.groupName,
            sessionName: sessionData.session_Name,
            subjectName: subjectData.subject_Name,
          };
        }));
        setPapers(updatedPapers);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching papers data:", error);
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  const handleViewClick = (groupName, catchNumber, subjectName) => {
    localStorage.setItem('generatedKeys', JSON.stringify({ groupName, catchNumber, subject_Name: subjectName }));
    navigate('/KeyGenerator/download-keys');
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>Papers</h3>
        <Button as={Link} to="NewPaper/" className="btn">
          Add Paper
        </Button>
      </div>
      <hr />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Group Name</th>
              <th>Session Name</th>
              <th>Catch Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper.paperID}>
                <td>{paper.paperID}</td>
                <td>{paper.groupName}</td>
                <td>{paper.sessionName}</td>
                <td>{paper.catchNumber}</td>
                <td><Button onClick={() => handleViewClick(paper.groupName, paper.catchNumber, paper.subjectName)}>View</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AllKeys;
