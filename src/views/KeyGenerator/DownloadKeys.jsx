import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Col, Row, Table } from 'react-bootstrap';
import { PDFDownloadLink } from '@react-pdf/renderer';
import KeyPdf from './Downloads/KeyPdf';
import ExportToExcel from './Downloads/ExportToExcel';
const baseUrl = process.env.REACT_APP_BASE_URL;

const DownloadKeys = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [groupid, setGroupid] = useState(null);
  const [sessionid, setSessionid] = useState(null);
  const [bookletsize, setBookletsize] = useState(null);
  const [examType, setExamType] = useState(null);
  const [catchNumber, setCatchNumber] = useState(null);
  const [setOrders, setSetOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve data from localStorage
        const storedData = localStorage.getItem('generatedKeys');
        if (storedData) {
          const { groupName, catchNumber, subject_Name, groupID, sessionID, bookletSize, examType } = JSON.parse(storedData);
          setGroupName(groupName);
          setCatchNumber(catchNumber);
          setGroupid(groupID);
          setSessionid(sessionID);
          setBookletsize(bookletSize);
          setExamType(examType);
          // Make API call with data from localStorage
          const response = await axios.get(
            `${baseUrl}/api/FormData/q?GroupName=${groupName}&CatchNumber=${catchNumber}&Subject=${subject_Name}`
          );

          // Set state with API response
          console.log(response.data)
          setApiResponse(response.data);

          // Make API call to get set orders
          const setOrdersResponse = await axios.get(
            `${baseUrl}/api/PaperConfig/Group/Session?groupID=${groupid}&sessionID=${sessionid}&bookletsize=${bookletsize}`
          );
          if (setOrdersResponse.data && setOrdersResponse.data.paperConfig) {
            const setOrder = setOrdersResponse.data.paperConfig.setOrder.split(',');
            setSetOrders(setOrder);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className='d-flex align-items-center justify-content-between'>
        <h3>Keys</h3>
        <span className='border border-2 px-2 rounded'>
          <h5 className="text-primary">
            Group: <span className="text-info">{groupName}</span> Catch Number: <span className="text-info">{catchNumber}</span>
          </h5>
        </span>
        <div className='d-flex gap-2'>
          <ExportToExcel data={apiResponse} group={groupName} catchno={catchNumber}/>
          <PDFDownloadLink document={<KeyPdf data={apiResponse} group={groupName} catchno={catchNumber} />} fileName={catchNumber}>
            {({ loading }) => loading ? <Button>Loading...</Button> : <Button>Download PDF</Button>}
          </PDFDownloadLink>
        </div>
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
              <Col md={3} key={index}>
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
