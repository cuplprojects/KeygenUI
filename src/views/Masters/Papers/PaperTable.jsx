import React, { useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import $ from 'jquery';

const PaperTable = ({ papers }) => {
  const tableRef = useRef(null);

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

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
  return (
    <div className="table-responsive">
      <Table striped bordered hover ref={tableRef}>
        <thead>
          <tr>
            {/* <th>Paper ID</th> */}
            {/* <th>Paper Name</th> */}
            <th>Group Name</th>
            <th>Session Name</th>
            <th>Catch Number</th>
            {/* <th>Paper Code</th> */}
            <th>Program Name</th>
            {/* <th>Exam Code</th> */}
            <th>Subject Name</th>
            {/* <th>Paper Number</th> */}
            <th>Exam Date</th>
            <th>Booklet Size</th>
            <th>Created At time</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper.paperID}>
              {/* <td>{paper.paperID}</td> */}
              {/* <td>{paper.paperName}</td> */}
              <td>{paper.groupName}</td>
              <td>{paper.sessionName}</td>
              <td>{paper.catchNumber}</td>
              {/* <td>{paper.paperCode}</td> */}
              <td>{paper.programName}</td>
              {/* <td>{paper.examCode}</td> */}
              <td>{paper.subjectName}</td>
              {/* <td>{paper.paperNumber}</td> */}
              <td>{formatDate(paper.examDate)}</td>
              <td>{paper.bookletSize}</td>
              <td>{formatDateTime(paper.createdAt)}</td>
              <td>{paper.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

PaperTable.propTypes = {
  papers: PropTypes.array.isRequired,
};

export default PaperTable;
