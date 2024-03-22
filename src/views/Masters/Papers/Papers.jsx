import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import PaperTable from "./PaperTable.jsx";
import { Link } from "react-router-dom";

const apiUrl = process.env.REACT_APP_BASE_URL;

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [papersData, groupsData, sessionsData, programsData, subjectsData, usersData] = await Promise.all([
          fetch(`${apiUrl}/api/Papers`).then(res => res.json()),
          fetch(`${apiUrl}/api/Group`).then(res => res.json()),
          fetch(`${apiUrl}/api/Sessions`).then(res => res.json()),
          fetch(`${apiUrl}/api/Program`).then(res => res.json()),
          fetch(`${apiUrl}/api/Subjects`).then(res => res.json()),
          fetch(`${apiUrl}/api/Users/GetUsers`).then(res => res.json())
        ]);

        const updatedPapers = papersData.map(paper => ({
          ...paper,
          groupName: groupsData.find(group => group.groupID === paper.groupID)?.groupName || "",
          sessionName: sessionsData.find(session => session.session_Id === paper.sessionID)?.session_Name || "",
          programName: programsData.find(program => program.programID === paper.programID)?.programName || "",
          subjectName: subjectsData.find(subject => subject.subject_Id === paper.subjectID)?.subject_Name || "",
          createdBy: usersData.find(user => user.user_ID === paper.createdByID)?.firstName || ""
        }));

        setPapers(updatedPapers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container className="userform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>Papers</h3>
        <Link to={`/Masters/AddPaper`} className="btn btn-primary">
          Add New Paper
        </Link>
      </div>
      <hr />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <PaperTable papers={papers} />
      )}
    </Container>
  );
};

export default Papers;
