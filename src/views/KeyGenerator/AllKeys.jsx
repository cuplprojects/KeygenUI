import React, { useState, useEffect } from "react";
import KeysTable from "./KeysTable";
import { Container, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_CHANGE_ANSWERKEYS;

const AllKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://localhost:7247/api/AnswerKeys')
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((data) => {
        const mappedKeys = data.map((key) => ({
          answerKey_Id: key.answerKey_Id,
          answerKey_Name: key.answerKey_Name,
          answerKey_filePath: key.answerKey_filePath,
        }));
        setKeys(mappedKeys);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching keys data:", error);
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  return (
    <Container className="userform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>Answer Keys</h3>
        <Button as={Link} to="Newkey/" className="btn">
          Add Key
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
        <KeysTable keys={keys} />
      )}
    </Container>
  );
};

export default AllKeys;
