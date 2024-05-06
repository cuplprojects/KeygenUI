import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from './../../../context/Security';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faKey, faUpload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_BASE_URL;


const PaperTable = ({ papers, token }) => {
  const { encrypt } = useSecurity();
  const tableRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

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

  // const formatDateTime = (dateTimeString) => {
  //   const date = new Date(dateTimeString);
  //   const day = date.getDate();
  //   const month = date.getMonth() + 1;
  //   const year = date.getFullYear();
  //   const hours = date.getHours();
  //   const minutes = date.getMinutes();
  //   const seconds = date.getSeconds();
  //   return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  // };

  const Generatekey = (paper) => {
    const { programmeID, programmeName, paperID, catchNumber } = paper;
    const paperData = { programmeID, programmeName, paperID, catchNumber };
    localStorage.setItem('paperdata', JSON.stringify(paperData));
    navigate('/KeyGenerator/Newkey');
  };

  const DownloadKey = async (paper) => {
    try {
      const progConfigResponse = await axios.get(`${apiUrl}/api/ProgConfigs/Programme/${paper.programmeID}/${paper.bookletSize}`, { headers: { Authorization: `Bearer ${token}` } });
      const progConfigData = progConfigResponse.data[0]; // Assuming the API returns an array with a single object
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
    <div className="table-responsive">
      <table className="table table-striped table-bordered table-hover" ref={tableRef}>
        <thead>
          <tr>
            <th>SN</th>
            <th>Program Name</th>
            <th>Catch Number</th>
            <th>Paper Name</th>
            <th>Subject Name</th>
            <th>Exam Date</th>
            <th>Booklet Size</th>
            <th>Created By</th>
            {/* <th>Master Uploaded</th> */}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper, index) => (
            <tr className="c-pointer" key={paper.paperID} onClick={() => handleRowClick(paper.paperID)}>
              <td>{index + 1}</td>
              <td>{paper.programmeName}</td>
              <td>{paper.catchNumber}</td>
              <td>{paper.paperName}</td>
              <td>{paper.subjectName}</td>
              <td>{formatDate(paper.examDate)}</td>
              <td>{paper.bookletSize}</td>
              <td>{paper.createdBy}</td>
              {/* <td>{paper.masterUploaded ? 'Yes' : 'No'}</td> */}
              <td onClick={(event) => event.stopPropagation()}>
                <div>
                  <DropdownButton id="dropdown-basic-button" title="Action" className='btn btn-sm'>
                    {paper.keyGenerated ?
                          <Dropdown.Item  onClick={() => DownloadKey(paper)}><FontAwesomeIcon icon={faDownload} className="me-2"/>Download Keys</Dropdown.Item>
                          : <>
                        {paper.masterUploaded ?
                          <Dropdown.Item onClick={() => Generatekey(paper)}><FontAwesomeIcon icon={faKey} className="me-2"/>Generate Key</Dropdown.Item>
                          :
                          <Dropdown.Item onClick={() => Generatekey(paper)}><FontAwesomeIcon icon={faUpload} className="me-2"/>Upload Master</Dropdown.Item>
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
    </div>
  );
};

PaperTable.propTypes = {
  papers: PropTypes.array.isRequired,
  token: PropTypes.string.isRequired,
};

export default PaperTable;
