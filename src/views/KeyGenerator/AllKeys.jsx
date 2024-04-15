import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import KeysTable from "./KeysTable";
import { useUser } from "./../../context/UserContext";
import axios from "axios";

const apiUrl = process.env.REACT_APP_BASE_URL;

const AllKeys = () => {
  const { keygenUser } = useUser();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/Papers`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        const papersData = response.data;

        const filteredPapersData = papersData.filter(paper => paper.keyGenerated); // Filter papers where keyGenerated is true

        setPapers(filteredPapersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    if (keygenUser?.token) {
      fetchData();
    }
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
