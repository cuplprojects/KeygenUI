import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';

const DownloadKeys = () => {
  const [csvData, setCsvData] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (apiResponse && apiResponse.answerKey_Name) {
          const response = await axios.get(`https://localhost:7247/api/FormData/${apiResponse.answerKey_Name}`);
          setCsvData(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiResponse]); // Fetch data when apiResponse changes

  useEffect(() => {
    const storedApiResponse = localStorage.getItem('apiResponse');
    if (storedApiResponse) {
      try {
        const parsedApiResponse = JSON.parse(storedApiResponse);
        setApiResponse(parsedApiResponse);
      } catch (error) {
        console.error('Error parsing stored apiResponse:', error);
      }
    }
  }, []); // Fetch stored apiResponse once when component mounts

  const downloadCSV = () => {
    let csvContent = 'S/N,';
    for (let i = 0; i < csvData.length; i++) {
      csvContent += `Set ${String.fromCharCode(65 + i)},,,`;
    }
    csvContent = csvContent.slice(0, -1) + '\n';

    for (let i = 0; i < csvData[0].length; i++) {
      csvContent += `${i + 1},`;
      for (let j = 0; j < csvData.length; j++) {
        if (csvData[j][i]) {
          const rowData = csvData[j][i].split(',');
          csvContent += `${rowData[0]},${rowData[1]},${rowData[2]},`;
        } else {
          csvContent += ',,,';
        }
      }
      csvContent = csvContent.slice(0, -1) + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'table_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      <div className='text-start m-3'>
      <button className="btn btn-primary" onClick={downloadCSV}>Download CSV</button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-bordered border-dark">
          <thead>
            <tr>
              <th></th> {/* Blank column */}
              {csvData.map((_, index) => (
                <React.Fragment key={index}>
                  <th></th> {/* Blank column before each CSV */}
                  <th colSpan="3" className={`Set${String.fromCharCode(65 + index)} text-center`}>Set {String.fromCharCode(65 + index)}</th>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <th>S/N</th>
              {csvData.map((_, index) => (
                <React.Fragment key={index}>
                  <th></th>
                  <th className={`CSV${index + 1}`}>Page No.</th>
                  <th className={`CSV${index + 1}`}>Q#</th>
                  <th className={`CSV${index + 1}`}>Key</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.length > 0 && csvData[0].map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{rowIndex + 1}</td> {/* Serial number */}
                {csvData.map((csv, csvIndex) => (
                  <React.Fragment key={csvIndex}>
                    <td></td> {/* Blank column before each CSV */}
                    {csv[rowIndex + 1] && csv[rowIndex + 1].split(',').map((cell, cellIndex) => (
                      <td className={`CSV${csvIndex + 1}`} key={cellIndex}>{cell}</td>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DownloadKeys;
