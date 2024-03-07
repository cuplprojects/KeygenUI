import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { Col, Row, Table } from 'react-bootstrap';

const DownloadKeys = () => {
  const [csvData, setCsvData] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve data from localStorage
        const storedData = localStorage.getItem('generatedKeys');
        if (storedData) {
          const { groupName, catchNumber, subject_Name } = JSON.parse(storedData);

          // Make API call with data from localStorage
          const response = await axios.get(
            `https://localhost:7247/api/FormData/q?GroupName=${groupName}&CatchNumber=${catchNumber}&Subject=${subject_Name}`
          );

          // Set state with API response
          setApiResponse(response.data);
          setCsvData(response.data); // Set CSV data for CSVLink
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const headers = [
    { label: 'Page Number', key: 'pageNumber' },
    { label: 'Question Number', key: 'questionNumber' },
    { label: 'Answer', key: 'answer' },
    { label: 'Set ID', key: 'setID' },
  ];

  return (
    <div>
      <div className='d-flex align-items-center justify-content-between mb-2'>
        <h1>Download Keys</h1>
        <CSVLink className='btn btn-primary' data={csvData} headers={headers}>Download CSV</CSVLink>
      </div>
      <hr />
      <Row>
        {apiResponse && (
          <>
            {apiResponse.reduce((tables, item) => {
              if (!tables[item.setID]) {
                tables[item.setID] = [];
              }
              tables[item.setID].push(
                <tr key={tables[item.setID].length}>
                  <td>{item.pageNumber}</td>
                  <td>{item.questionNumber}</td>
                  <td>{item.answer}</td>
                </tr>
              );
              return tables;
            }, []).map((table, index) => (
              <Col md={3} key={index}> {/* Add key prop here */}
                <Table striped bordered>
                  <thead>
                    <tr className='text-center'>
                      <th colSpan="3">Set {index}</th>
                    </tr>
                    <tr>
                      <th>Page Number</th>
                      <th>Question Number</th>
                      <th>Answer</th>
                    </tr>
                  </thead>
                  <tbody>{table}</tbody>
                </Table>
              </Col>
            ))}
          </>
        )}
      </Row>
    </div>
  );
};

export default DownloadKeys;
