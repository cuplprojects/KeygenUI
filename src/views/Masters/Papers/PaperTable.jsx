import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from './../../../context/Security';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faKey, faUpload, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_BASE_URL;

const PaperTable = ({ papers, token }) => {
  const { encrypt } = useSecurity();
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

  const handleRowClick = (paperID) => {
    navigate(`/Masters/papers/ViewPaper/${encrypt(paperID)}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const Generatekey = (paper) => {
    const { programmeID, programmeName, paperID, catchNumber } = paper;
    const paperData = { programmeID, programmeName, paperID, catchNumber };
    localStorage.setItem('paperdata', JSON.stringify(paperData));
    navigate('/KeyGenerator/Newkey');
  };

  const DownloadKey = async (paper) => {
    try {
      const progConfigResponse = await axios.get(`${apiUrl}/api/ProgConfigs/Programme/${paper.programmeID}/${paper.bookletSize}`, { headers: { Authorization: `Bearer ${token}` } });
      const progConfigData = progConfigResponse.data[0];
      const progConfigID = progConfigData.progConfigID;

      const paperData = {
        programmeID: paper.programmeID,
        paperID: paper.paperID,
        catchNumber: paper.catchNumber,
        progConfigID: progConfigID
      };
      localStorage.setItem('generatedKeys', JSON.stringify(paperData));
      navigate('/KeyGenerator/Newkey/download-keys');
    } catch (error) {
      console.error("Error fetching progConfigID:", error);
    }
  };

  return (

      <table className="table table-striped table-bordered table-hover">
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
            <tr className="c-pointer" key={paper.paperID} onClick={() => handleRowClick(paper.paperID)}>
              <td>{paper.paperID}</td>
              <td>{paper.programmeName}</td>
              <td>{paper.catchNumber}</td>
              <td style={{ maxWidth: '150vw' }}>{paper.paperName}</td>
              <td >{paper.subjectName}</td>
              <td>{formatDate(paper.examDate)}</td>
              <td>{paper.bookletSize}</td>
              <td>{paper.createdBy}</td>
              <td onClick={(event) => event.stopPropagation()}>
                <div>
                  <DropdownButton id="dropdown-basic-button" title="Action" className='btn btn-sm'>
                    {paper.keyGenerated ?
                      <Dropdown.Item onClick={() => DownloadKey(paper)}><FontAwesomeIcon icon={faDownload} className="me-2" />Download Keys</Dropdown.Item>
                      : <>
                        {paper.masterUploaded ?
                          <Dropdown.Item onClick={() => Generatekey(paper)}><FontAwesomeIcon icon={faKey} className="me-2" />Generate Key</Dropdown.Item>
                          :
                          <Dropdown.Item onClick={() => Generatekey(paper)}><FontAwesomeIcon icon={faUpload} className="me-2" />Upload Master</Dropdown.Item>
                        }
                      </>
                    }
                    <Dropdown.Item onClick={() => navigate(`/Masters/papers/ViewPaper/${encrypt(paper.paperID)}`)}> <FontAwesomeIcon icon={faEye} className="me-2" />View Paper</Dropdown.Item>
                  </DropdownButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  );
};

PaperTable.propTypes = {
  papers: PropTypes.array.isRequired,
  token: PropTypes.string.isRequired,
};

export default PaperTable;
