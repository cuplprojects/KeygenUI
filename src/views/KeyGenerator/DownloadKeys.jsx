import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button, Col, Dropdown, DropdownButton, Row, Table } from 'react-bootstrap';
import { PDFDownloadLink } from '@react-pdf/renderer';
import KeyPdf from './Downloads/KeyPdf';
import { useUser } from './../../context/UserContext';
import { useNavigate } from 'react-router-dom';

import ExportToExcel from './Downloads/ExportToExcel';
import ExportFormat2 from './Downloads/ExportFormat2';

// import Keyi from './Downloads/Keyi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faFileExport, faFilePdf, faEye } from '@fortawesome/free-solid-svg-icons';
import Excel75intworows from './Downloads/Excel75intworows';
import { useSecurity } from './../../context/Security';
const baseUrl = process.env.REACT_APP_BASE_URL;
const DownloadKeys = () => {
    const { encrypt } = useSecurity();
  const navigate = useNavigate();
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
  const [pdfVerification, setPdfVerification] = useState(false);
  const [manualKeyStatus, setManualKeyStatus] = useState(null);

  const fetchPDFVerification = async () => {
    try {
      // Always perform validation, even if parameters appear to be null or undefined
      const programId = progID || '';
      const catchNum = catchNumber || '';

      const response = await axios.get(
        `${baseUrl}/api/PDFfile/GetPDFVerificationStatus?ProgramId=${programId}&CatchNumber=${catchNum}`,
        { headers: { Authorization: `Bearer ${keygenUser?.token}` } }
      );

      // Update the state based on the API response
      setPdfVerification(response.data);
      console.log("PDF verification status:", response.data);
    } catch (error) {
      console.error('Error fetching PDF verification status:', error);
      // Set default value on error
      setPdfVerification(false);
    }
  };

useEffect(() => {
    fetchPDFVerification();
}, [progID, catchNumber]);

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
    const fetchPaperData = async () => {
      try {
        const paperResponse = await axios.get(`${baseUrl}/api/Papers/${PaperID}`, {
          headers: { Authorization: `Bearer ${keygenUser?.token}` },
        });
        setPaperData(paperResponse.data);
      } catch (error) {
        console.error('Error fetching paper data:', error);
      }
    };

    const fetchManualKeyStatus = async () => {
      try {
        // Always perform validation, even if PaperID appears to be null or undefined
        const paperId = PaperID || '';

        const response = await axios.get(
          `${baseUrl}/api/ManualKeyExcelData/CheckManualKeyExcelData/${paperId}`,
          { headers: { Authorization: `Bearer ${keygenUser?.token}` } }
        );
        setManualKeyStatus(response.data);
        console.log("Manual key status:", response.data);
      } catch (error) {
        console.error('Error fetching manual key status:', error);
        // Set default value on error
        setManualKeyStatus(null);
      }
    };

    // Always call both functions, regardless of PaperID value
    fetchPaperData();
    fetchManualKeyStatus();
  }, [PaperID, keygenUser?.token]);




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

// console.log(apiResponse)
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
          <DropdownButton
            id="export-dropdown"
            title={<><FontAwesomeIcon icon={faFileExport} className="me-2" />Export</>}
            variant="primary"
            disabled={!pdfVerification || (manualKeyStatus && manualKeyStatus.status === "Exists")}
          >
            <Dropdown.Item disabled={!pdfVerification || (manualKeyStatus && manualKeyStatus.status === "Exists")}>
              <ExportToExcel data={apiResponse} paperData={paperData} group={programData?.programmeName} catchno={catchNumber} setlen={setOrders.length} />
            </Dropdown.Item>
            <Dropdown.Item disabled={!pdfVerification || (manualKeyStatus && manualKeyStatus.status === "Exists")}>
              <ExportFormat2 data={apiResponse} paperData={paperData} group={programData?.programmeName} catchno={catchNumber} setlen={setOrders.length} />
            </Dropdown.Item>
            <Dropdown.Item disabled={!pdfVerification || (manualKeyStatus && manualKeyStatus.status === "Exists")}>
              <Excel75intworows data={apiResponse} paperData={paperData} group={programData?.programmeName} catchno={catchNumber} setlen={setOrders.length} />
            </Dropdown.Item>

            <Dropdown.Item disabled={!pdfVerification || (manualKeyStatus && manualKeyStatus.status === "Exists")}>
              <div>
                <PDFDownloadLink document={<KeyPdf data={apiResponse} paperData={paperData} group={programData?.programmeName} catchno={catchNumber} />} fileName={`${catchNumber}.pdf`}>
                  {({ blob, loading }) => (loading ?
                    <Button disabled={!pdfVerification || (manualKeyStatus && manualKeyStatus.status === "Exists")}>Loading...</Button> :
                    <Button disabled={!pdfVerification || (manualKeyStatus && manualKeyStatus.status === "Exists")} onClick={() => {
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `${catchNumber}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}><FontAwesomeIcon icon={faFilePdf} className="me-2" /> Export to PDF</Button>
                  )}
                </PDFDownloadLink>
              </div>
            </Dropdown.Item>

            {/* <Dropdown.Item>
              <PDFDownloadLink document={<Keyi data={apiResponse} group={programData?.programmeName} catchno={catchNumber} />} fileName={catchNumber}>
                {({ loading }) => (loading ? <Button>Loading...</Button> : <Button><FontAwesomeIcon icon={faFilePdf} className="me-2" /> Export to PDF</Button>)}
              </PDFDownloadLink>
            </Dropdown.Item> */}
          </DropdownButton>
        </div>
      </div>
      <hr />
      {pdfVerification === false && (
        <Alert variant="danger" className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Warning:</strong> PDF verification has failed or is incorrect for this paper.
              Please verify the PDF before downloading keys.
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/verification/verificaton`)}
            >
              <FontAwesomeIcon icon={faEye} className="me-2" /> Go to Verification
            </Button>
          </div>
        </Alert>
      )}
      {manualKeyStatus && manualKeyStatus.status === "Exists" && (
        <Alert variant="danger" className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Warning:</strong> Manual keys have been found for this paper.
              Last updated on {new Date(manualKeyStatus.lastUpdatedDateTime).toLocaleString()}
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate(`/Masters/Papers/ViewPaper/${encrypt(PaperID)}`)}
            >
              <FontAwesomeIcon icon={faEye} className="me-2" /> View Paper Details
            </Button>
          </div>
        </Alert>
      )}
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
