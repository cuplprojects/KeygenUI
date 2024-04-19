import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import { Link, useNavigate } from 'react-router-dom';
import { useSecurity } from './../../../context/Security';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faUpload } from '@fortawesome/free-solid-svg-icons';

const PaperTable = ({ papers }) => {
  const { encrypt } = useSecurity();
  const tableRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

  const handleRowClick = (paperID) => {
    // navigate(`/Masters/papers/ViewPaper/${encrypt(paperID)}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const Generatekey = (programmeID, programme, PaperID, catchNumber) => {
    const paperData = { programmeID, programme, PaperID, catchNumber };
    localStorage.setItem('paperdata', JSON.stringify(paperData));
    navigate('/KeyGenerator/Newkey');
  }
  const DownloadKey = (programmeID, paperID, catchNumber, progConfigID) => {
    const paperData = { programmeID, paperID, catchNumber, progConfigID };
    localStorage.setItem('generatedKeys', JSON.stringify(paperData));
    navigate('/KeyGenerator/Newkey/download-keys');
  }


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
              <td>
                <div>
                  <DropdownButton id="dropdown-basic-button" title="Action" className='btn btn-sm'>
                    {paper.keyGenerated ?
                      <Dropdown.Item onClick={() => DownloadKey(paper.programmeID, paper.paperID, paper.catchNumber, paper.progConfigID)}> <FontAwesomeIcon icon={faDownload} /> Download Key</Dropdown.Item>
                      : <>
                        {paper.masterUploaded ?
                          <Dropdown.Item onClick={() => Generatekey(paper.programmeID, paper.programmeName, paper.paperID, paper.catchNumber)}>Generate Key</Dropdown.Item>
                          :
                          <Dropdown.Item onClick={() => Generatekey(paper.programmeID, paper.programmeName, paper.paperID, paper.catchNumber)}><FontAwesomeIcon icon={faUpload} /> Upload Master</Dropdown.Item>
                        }
                      </>
                    }
                    <Dropdown.Item onClick={() => navigate(`/Masters/papers/ViewPaper/${encrypt(paper.paperID)}`)}> <FontAwesomeIcon icon={faEye} /> View Paper</Dropdown.Item>
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
};

export default PaperTable;
