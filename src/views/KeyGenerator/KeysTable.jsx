import React, { useState } from "react";
import PropTypes from "prop-types";
import { Table, DropdownButton, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
const apiUrl = process.env.REACT_APP_BASE_URL;


const KeysTable = ({ papers, token }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const sortedPapers = papers.sort((a, b) => {
    if (sortBy === null) return 0;

    const sortMultiplier = sortDir === 'asc' ? 1 : -1;
    if (a[sortBy] < b[sortBy]) return -1 * sortMultiplier;
    if (a[sortBy] > b[sortBy]) return 1 * sortMultiplier;
    return 0;
  });

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
      <Table striped bordered hover >
        <thead>
        <tr>
            <th className='text-center c-pointer align-middle' onClick={() => handleSort('paperID')}>Paper ID {sortBy === 'paperID' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center c-pointer align-middle' onClick={() => handleSort('programmeName')}>Program Name {sortBy === 'programmeName' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center c-pointer align-middle' onClick={() => handleSort('catchNumber')}>Catch Number {sortBy === 'catchNumber' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center c-pointer align-middle' style={{ maxWidth: '15vw' }} onClick={() => handleSort('paperName')}>Paper Name {sortBy === 'paperName' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center c-pointer align-middle' onClick={() => handleSort('subjectName')}>Subject Name {sortBy === 'subjectName' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center c-pointer align-middle' onClick={() => handleSort('examDate')}>Exam Date {sortBy === 'examDate' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center c-pointer align-middle' onClick={() => handleSort('bookletSize')}>Booklet Size {sortBy === 'bookletSize' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center c-pointer align-middle' onClick={() => handleSort('createdBy')}>Created By {sortBy === 'createdBy' && <FontAwesomeIcon icon={sortDir === 'asc' ? faSortUp : faSortDown} />}</th>
            <th className='text-center align-middle'>Action</th>

          </tr>
        </thead>
        <tbody>
        {sortedPapers && sortedPapers.map((paper, index) => (
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
                    <FontAwesomeIcon icon={faDownload} className="me-2" />Download Key
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