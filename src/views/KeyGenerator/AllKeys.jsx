import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import KeysTable from "./KeysTable";
import { useUser } from "./../../context/UserContext";

const apiUrl = process.env.REACT_APP_BASE_URL;

const AllKeys = () => {
  const { keygenUser } = useUser();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersData, programsData, coursesData, subjectsData, usersData] = await Promise.all([
          fetch(`${apiUrl}/api/Papers`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }).then(res => res.json()),
          fetch(`${apiUrl}/api/Programmes`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }).then(res => res.json()),
          fetch(`${apiUrl}/api/Courses`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }).then(res => res.json()),
          fetch(`${apiUrl}/api/Subjects`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }).then(res => res.json()),
          fetch(`${apiUrl}/api/Users/GetUsers`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }).then(res => res.json())
        ]);
    
        const filteredPapersData = papersData.filter(paper => paper.keyGenerated); // Filter papers where keyGenerated is true
    
        const updatedPapers = await Promise.all(filteredPapersData.map(async (paper) => {
          const progConfigsResponse = await fetch(`${apiUrl}/api/ProgConfigs/Programme/${paper.programmeID}/${paper.bookletSize}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          const progConfigsData = await progConfigsResponse.json();
          const progConfigID = progConfigsData[0]?.progConfigID || 0;
    
          return {
            ...paper,
            progConfigID: progConfigID,
            programmeName: programsData.find(program => program.programmeID === paper.programmeID)?.programmeName || "--",
            courseName: coursesData.find(course => course.courseID === paper.courseID)?.courseName || "--",
            subjectName: subjectsData.find(subject => subject.subjectID === paper.subjectID)?.subjectName || "--",
            createdBy: usersData.find(user => user.userID === paper.createdByID)?.firstName || "--"
          };
        }));
    
        setPapers(updatedPapers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [keygenUser?.token]);

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
