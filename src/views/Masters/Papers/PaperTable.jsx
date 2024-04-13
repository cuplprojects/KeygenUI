import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from './../../../context/Security';

const PaperTable = ({ papers }) => {
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
console.log(papers)
  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered table-hover" ref={tableRef}>
        <thead>
          <tr>
            <th>Program Name</th>
            <th>Catch Number</th>
            <th>Paper Name</th>
            <th>Subject Name</th>
            <th>Exam Date</th>
            <th>Booklet Size</th>
            <th>Created At time</th>
            <th>Created By</th>
            <th>Master Uploaded</th>
            <th>Key Generated</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr className="c-pointer" key={paper.paperID} onClick={() => handleRowClick(paper.paperID)}>
              <td>{paper.programmeName}</td>
              <td>{paper.catchNumber}</td>
              <td>{paper.paperName}</td>
              <td>{paper.subjectName}</td>
              <td>{formatDate(paper.examDate)}</td>
              <td>{paper.bookletSize}</td>
              <td>{formatDateTime(paper.createdAt)}</td>
              <td>{paper.createdBy}</td>
              <td>{paper.masterUploaded ? 'Yes' : 'No'}</td>
              <td>{paper.keyGenerated ? 'Yes' : 'No'}</td>
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
