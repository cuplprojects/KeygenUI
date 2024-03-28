import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Table } from "react-bootstrap";
import $ from 'jquery';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const KeysTable = ({ papers }) => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

  const handleViewClick = (groupName, catchNumber, subjectName) => {
    localStorage.setItem('generatedKeys', JSON.stringify({ groupName, catchNumber, subject_Name: subjectName }));
    navigate('/KeyGenerator/download-keys');
  };

  return (
    <Table striped bordered hover ref={tableRef}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Group Name</th>
          <th>Session Name</th>
          <th>Catch Number</th>
          <th>Subject</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {papers.map((paper) => (
          <tr className="c-pointer" key={paper.paperID} onClick={() => handleViewClick(paper.groupName, paper.catchNumber, paper.subjectName)}>
            <td>{paper.paperID}</td>
            <td>{paper.groupName}</td>
            <td>{paper.sessionName}</td>
            <td>{paper.catchNumber}</td>
            <td>{ paper.subjectName}</td>
            <td className="text-center text-success"><FontAwesomeIcon icon={faEye} onClick={() => handleViewClick(paper.groupName, paper.catchNumber, paper.subjectName)} /></td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

KeysTable.propTypes = {
  papers: PropTypes.arrayOf(PropTypes.shape({
    paperID: PropTypes.number.isRequired,
    groupName: PropTypes.string.isRequired,
    sessionName: PropTypes.string.isRequired,
    catchNumber: PropTypes.number.isRequired,
    subjectName: PropTypes.string.isRequired,
  })).isRequired,
};

export default KeysTable;
