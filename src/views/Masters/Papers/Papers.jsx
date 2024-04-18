import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import PaperTable from "./PaperTable.jsx";
import { Link } from "react-router-dom";
import { useUser } from "./../../../context/UserContext.js";
import axios from "axios";

const apiUrl = process.env.REACT_APP_BASE_URL;

const Papers = () => {
  const { keygenUser } = useUser();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const papersData = await axios.get(`${apiUrl}/api/Papers`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } }).then(res => res.data);

        // Fetch progConfigID for each paper
        const updatedPapersData = await Promise.all(papersData.map(async (paper) => {
          const progConfigResponse = await axios.get(`${apiUrl}/api/ProgConfigs/Programme/${paper.programmeID}/${paper.bookletSize}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          const progConfigData = progConfigResponse.data[0]; // Assuming the API returns an array with a single object
          return {
            ...paper,
            progConfigID: progConfigData.progConfigID
          };
        }));

        setPapers(updatedPapersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [keygenUser?.token]);

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
