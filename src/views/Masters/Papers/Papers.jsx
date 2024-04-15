import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import PaperTable from "./PaperTable.jsx";
import { Link } from "react-router-dom";
import { useUser } from "./../../../context/UserContext.js";

const apiUrl = process.env.REACT_APP_BASE_URL;

const Papers = () => {
  const { keygenUser } = useUser();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const papersData = await fetch(`${apiUrl}/api/Papers`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }).then(res => res.json());

        setPapers(papersData);
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
