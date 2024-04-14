import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Table, Button, DropdownButton, Dropdown } from "react-bootstrap";
import $ from 'jquery';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faDownload } from "@fortawesome/free-solid-svg-icons";

const KeysTable = ({ papers }) => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

  const handleDownloadClick = (paperID) => {
    // Logic to download keys for the given paperID
    const paper = papers.find(paper => paper.paperID === paperID);
    if (paper) {
      const { programmeID, paperID, catchNumber, progConfigID } = paper;
      const paperData = { programmeID, paperID, catchNumber, progConfigID };
      localStorage.setItem('generatedKeys', JSON.stringify(paperData));
      navigate('/KeyGenerator/download-keys');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  return (
    <div className="table-responsive">
      <Table striped bordered hover ref={tableRef}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Program Name</th>
            <th>Catch Number</th>
            <th>Paper Name</th>
            <th>Subject Name</th>
            <th>Exam Date</th>
            <th>Booklet Size</th>
            <th>Created By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper.paperID}>
              <td>{paper.paperID}</td>
              <td>{paper.programmeName}</td>
              <td>{paper.catchNumber}</td>
              <td>{paper.paperName}</td>
              <td>{paper.subjectName}</td>
              <td>{formatDate(paper.examDate)}</td>
              <td>{paper.bookletSize}</td>
              <td>{paper.createdBy}</td>
              <td>
                <DropdownButton id={`dropdown-button-${paper.paperID}`} title="Action" size="sm">
                  <Dropdown.Item onClick={() => handleDownloadClick(paper.paperID)}>
                    <FontAwesomeIcon icon={faDownload} /> Download Key
                  </Dropdown.Item>
                </DropdownButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

KeysTable.propTypes = {
  papers: PropTypes.arrayOf(PropTypes.shape({
    paperID: PropTypes.number.isRequired,
    programmeName: PropTypes.string.isRequired,
    catchNumber: PropTypes.number.isRequired,
    paperName: PropTypes.string.isRequired,
    subjectName: PropTypes.string.isRequired,
    examDate: PropTypes.string.isRequired,
    bookletSize: PropTypes.string.isRequired,
    createdBy: PropTypes.string.isRequired,
    progConfigID: PropTypes.number.isRequired,
  })).isRequired,
};

export default KeysTable;
