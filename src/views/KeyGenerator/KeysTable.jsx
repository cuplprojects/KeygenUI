import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Table, DropdownButton, Dropdown } from "react-bootstrap";
import $ from 'jquery';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
const apiUrl = process.env.REACT_APP_BASE_URL;


const KeysTable = ({ papers, token }) => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

  const handleDownloadClick = async (paper) => {
    try {
      const progConfigResponse = await axios.get(`${apiUrl}/api/ProgConfigs/Programme/${paper.programmeID}/${paper.bookletSize}`, { headers: { Authorization: `Bearer ${token}` } });
      const progConfigID = progConfigResponse.data[0]?.progConfigID;
  
      if (progConfigID) {
        const paperData = { 
          paperID: paper.paperID, 
          progConfigID, 
          programmeID: paper.programmeID, 
          catchNumber: paper.catchNumber, 
          bookletSize: paper.bookletSize 
        };
        localStorage.setItem('generatedKeys', JSON.stringify(paperData));
        navigate('/KeyGenerator/Newkey/download-keys');
      } else {
        console.error("No progConfigID found for paper:", paper);
      }
    } catch (error) {
      console.error("Error fetching progConfigID:", error);
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
                  <Dropdown.Item onClick={() => handleDownloadClick(paper)}>
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
  papers: PropTypes.array.isRequired,
  token: PropTypes.string.isRequired,
};

export default KeysTable;