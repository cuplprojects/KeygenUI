import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Col, Dropdown, DropdownButton, Row, Table } from 'react-bootstrap';
import { PDFDownloadLink } from '@react-pdf/renderer';
import KeyPdf from './Downloads/KeyPdf';
import { useUser } from './../../context/UserContext';

import ExportToExcel from './Downloads/ExportToExcel';
import Keyi from './Downloads/Keyi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faFilePdf } from '@fortawesome/free-solid-svg-icons';
const baseUrl = process.env.REACT_APP_BASE_URL;
const DownloadKeys = () => {
  const { keygenUser } = useUser();
  const [apiResponseold, setApiResponseold] = useState(null); // without set orders
  const [apiResponse, setApiResponse] = useState(null); // with set order a,b,c,d
  const [PaperID, setPaperID] = useState(null);
  const [progConfigID, setProgConfigID] = useState(null);
  const [progID, setProgID] = useState(null);
  const [catchNumber, setCatchNumber] = useState(null);
  const [setOrders, setSetOrders] = useState([]);
  const [paperData, setPaperData] = useState(null);
  const [programData, setProgramData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = localStorage.getItem('generatedKeys');
        if (storedData) {
          const { programmeID, catchNumber, paperID, progConfigID } = JSON.parse(storedData);
          setPaperID(paperID);
          setCatchNumber(catchNumber);
          setProgID(programmeID);
          setProgConfigID(progConfigID);

          const response = await axios.get(
            `${baseUrl}/api/FormData?progID=${programmeID}&CatchNumber=${catchNumber}&PaperID=${paperID}`,
            { headers: { Authorization: `Bearer ${keygenUser?.token}` } }
          );
          setApiResponseold(response.data);

          // Fetch program data
          const programResponse = await axios.get(`${baseUrl}/api/Programmes/${programmeID}`, {
            headers: { Authorization: `Bearer ${keygenUser?.token}` },
          });
          setProgramData(programResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSetOrders = async () => {
      try {
        const setOrdersResponse = await axios.get(`${baseUrl}/api/ProgConfigs`, {
          headers: { Authorization: `Bearer ${keygenUser?.token}` },
        });
        if (setOrdersResponse.data) {
          const filteredConfigs = setOrdersResponse.data.filter((config) => config.progConfigID === progConfigID);
          const setOrder = filteredConfigs.map((config) => config.setOrder).join(',');
          setSetOrders(setOrder.split(',')); // Split set orders into an array
        }
      } catch (error) {
        console.error('Error fetching set orders:', error);
      }
    };
    fetchSetOrders(); // Moved fetchSetOrders outside of the if statement to ensure it always runs
  }, [progConfigID, keygenUser?.token]); // Added keygenUser?.token to the dependencies

  useEffect(() => {
    if (apiResponseold && setOrders.length > 0) {
      const updatedApiResponse = apiResponseold.map((item) => {
        return {
          ...item,
          setID: setOrders[item.setID - 1], // Adjusted index for 0-based array
        };
      });
      setApiResponse(updatedApiResponse);
    }
  }, [apiResponseold, setOrders]);
  return (
    <div>
      <div className='d-flex align-items-center justify-content-between'>
        <h3>Keys</h3>
        <span className='border border-2 px-2 rounded'>
          <h5 className='text-primary'>
            Group: <span className='text-info'>{programData?.programmeName}</span> Catch Number: <span className='text-info'>{catchNumber}</span>
          </h5>
        </span>
        <div className='d-flex gap-2'>
          <DropdownButton id="export-dropdown" title={<><FontAwesomeIcon icon={faFilePdf} className="me-2" />Export</>} variant="primary">
            <Dropdown.Item>
              <ExportToExcel data={apiResponse} group={programData?.programmeName} catchno={catchNumber} setlen={setOrders.length} />

            </Dropdown.Item>
            {/* <Dropdown.Item>
              <PDFDownloadLink document={<KeyPdf data={apiResponse} group={programData?.programmeName} catchno={catchNumber} />} fileName={catchNumber}>
                {({ loading }) => (loading ? <Button>Loading...</Button> : <Button><FontAwesomeIcon icon={faFilePdf} className="me-2" /> Export to PDF</Button>)}
              </PDFDownloadLink>
            </Dropdown.Item> */}
            <Dropdown.Item>
              <PDFDownloadLink document={<Keyi data={apiResponse} group={programData?.programmeName} catchno={catchNumber} />} fileName={catchNumber}>
                {({ loading }) => (loading ? <Button>Loading...</Button> : <Button><FontAwesomeIcon icon={faFilePdf} className="me-2" /> Export to PDF</Button>)}
              </PDFDownloadLink>
            </Dropdown.Item>
          </DropdownButton>
        </div>
      </div>
      <hr />
      <Row>
        {apiResponse &&
          apiResponse.reduce((tables, item) => {
            const setIdNum = setOrders.indexOf(item.setID); // Get the index of setID in setOrders
            if (!tables[setIdNum]) {
              tables[setIdNum] = [];
            }
            tables[setIdNum].push(
              <tr key={tables[setIdNum].length}>
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
                    <th colSpan='3'>Set {setOrders[index]}</th>
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
      </Row>
    </div>
  );
};

export default DownloadKeys;
