import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import KeysTable from "./KeysTable";
import { useUser } from "./../../context/UserContext";

const baseUrl = process.env.REACT_APP_BASE_URL;

const AllKeys = () => {
  const {keygenUser} = useUser();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/Papers`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then(async (data) => {
        const filteredPapers = data.filter((paper) => paper.keyGenerated === true);
        const updatedPapers = await Promise.all(filteredPapers.map(async (paper) => {
          const groupResponse = await fetch(`${baseUrl}/api/Groups/${paper.groupID}`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          const groupData = await groupResponse.json();
          const sessionResponse = await fetch(`${baseUrl}/api/Sessions/${paper.sessionID}`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          const sessionData = await sessionResponse.json();
          const subjectResponse = await fetch(`${baseUrl}/api/Subjects/${paper.subjectID}`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });
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

  return (
    <Container className="userform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>All Generated Keys</h3>
      </div>
      <hr />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status"></Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <KeysTable papers={papers} />
      )}
    </Container>
  );
};

export default AllKeys;
