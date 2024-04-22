import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import PaperTable from "./PaperTable.jsx";
import { Link } from "react-router-dom";
import { useUser } from "./../../../context/UserContext.js";
import axios from "axios";
import PaperPlaceholder from "./../../../MyPlaceholders/PaperPlaceholder.jsx";

const apiUrl = process.env.REACT_APP_BASE_URL;

const Papers = () => {
  const { keygenUser } = useUser();
  const token = keygenUser?.token;
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const papersData = await axios.get(`${apiUrl}/api/Papers`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

        setPapers(papersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <Container className="userform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>Papers</h3>
        <Link to={`/Masters/papers/AddPaper`} className="btn btn-primary">
          Add New Paper
        </Link>
      </div>
      <hr />

      {loading ? (
        <div className="text-center">
         <PaperPlaceholder/>
        </div>
      ) : (
        <PaperTable papers={papers} token={token}/>
      )}
    </Container>
  );
};

export default Papers;
