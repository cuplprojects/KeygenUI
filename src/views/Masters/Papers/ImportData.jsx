// bulk upload paper updated by Shivom at 18/09/24
// It was matching duplicate catch in client side which cause browser timeout, fixed by backend validation.
import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Button, ProgressBar, Badge, Spinner } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import $ from 'jquery';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useUser } from './../../../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import DownloadFailedRecords from './downloadExcels/DownloadFailedRecords';

const baseUrl = process.env.REACT_APP_BASE_URL;

const ImportData = ({ programmeID, setSelecedfile, bookletSize }) => {
  const { keygenUser } = useUser();
  const tableRef = useRef(null);
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [failedRecords, setFailedRecords] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [submittedRecords, setSubmittedRecords] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state to manage submission status
  const [isFileReading, setIsFileReading] = useState(false); // Added state to manage error status
  

  useEffect(() => {
    if (tableRef.current) {
      $(tableRef.current).DataTable();
    }
  }, [data]);

  useEffect(() => {
    fetchSubjects();
    fetchCourses();
  }, []);

  useEffect(() => {
    // Clear data and reset states when programmeID or file changes
    if (programmeID ) {
      cleardata()
    }
  }, [programmeID]);

  const cleardata = ()=>{
      setData([]);
      setFailedRecords([]);
      setSubmittedRecords(0);
      setTotalRecords(0);
      setProgress(0);
      setIsSubmitting(false);
  }
  

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Subjects`, {
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/Courses`, {
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const matchSubject = (subjectName) => {
    return subjects.find((subject) => subject.subjectName?.replace(/[.\s-]/g, '').toLowerCase() === subjectName?.replace(/[.\s-]/g, '').toLowerCase());
  };

  const matchCourse = (courseName) => {
    return courses.find((course) => course.courseName.replace(/[.\s-]/g, '').toLowerCase() === courseName?.replace(/[.\s-]/g, '').toLowerCase());
  };

  const handleAddSubject = async (subjectName) => {
    try {
      const response = await axios.post(`${baseUrl}/api/Subjects`, { subjectName }, {
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        }
      });
      setSubjects([...subjects, response.data]);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleAddCourse = async (courseName) => {
    try {
      const response = await axios.post(`${baseUrl}/api/Courses`, { courseName }, {
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        }
      });
      setCourses([...courses, response.data]);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const handleFileChange = (e) => {
    if (!programmeID || bookletSize < 1) {
      alert("Please select a program and booklet size first");
      e.target.value = '';
      return;
    }
    cleardata()
    const file = e.target.files[0];
    if (!file) {
      setSelecedfile(false);
      return;
    }
    setIsFileReading(true);
    setFile(file);
    setSelecedfile(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = jsonData[0];
      const mappedData = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const mappedRow = {
          SN: i,
          createdByID: keygenUser?.userID,
          programmeID: programmeID,
          bookletSize: bookletSize,
        };

        // Map Course and get real courseID
        if (headers.includes('Course')) {
          const courseName = row[headers.indexOf('Course')];
          mappedRow.courseName = courseName;
          const matchedCourse = matchCourse(courseName);
          mappedRow.courseID = matchedCourse?.courseID || null;
        }

        // Map Subject and get real subjectID
        if (headers.includes('Subject')) {
          const subjectName = row[headers.indexOf('Subject')];
          mappedRow.subjectName = subjectName;
          const matchedSubject = matchSubject(subjectName);
          mappedRow.subjectID = matchedSubject?.subjectID || null;
        }

        // Map other fields
        if (headers.includes('Catch No.')) {
          const catchNumberIndex = headers.indexOf('Catch No.');
          const catchNumberValue = row[catchNumberIndex];
          mappedRow.catchNumber = catchNumberValue ? String(catchNumberValue) : '';
        }

        if (headers.includes('Exam Type')) {
          mappedRow.examType = row[headers.indexOf('Exam Type')];
        }

        if (headers.includes('Paper Name')) {
          mappedRow.paperName = row[headers.indexOf('Paper Name')];
        }

        if (headers.includes('Exam Date')) {
          const examDateTimeString = row[headers.indexOf('Exam Date')];
          const examDateTime = new Date(examDateTimeString);
          if (!isNaN(examDateTime.getTime())) {
            mappedRow.examDate = examDateTime.toISOString();
          }
        }

        mappedData.push(mappedRow);
      }

      setData(mappedData);
      setIsFileReading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmitdata = async (e) => {
    e.preventDefault();
    if (!programmeID || !bookletSize || data.some(row => !row.catchNumber) || data.some(row => !row.courseName) || data.some(row => !row.examType)) {
      alert('Please fill in all required fields.');
      return;
    }
  
    setIsSubmitting(true); // Start submission process
    setTotalRecords(data.length);
    setFailedRecords([]); // Clear previous failed records
    setSubmittedRecords(0); // Reset submitted records count
    setProgress(0); // Reset progress
  
    // Process records in a loop
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const updatedRow = { ...row, programmeID}; // Add programmeID to the record
  
      try {
        const response = await axios.post(`${baseUrl}/api/Papers`, updatedRow, {
          headers: {
            Authorization: `Bearer ${keygenUser?.token}`,
            'Content-Type': 'application/json',
          },
        });
  
        // Update success count
        setSubmittedRecords((prev) => prev + 1);
        // Update progress
        setProgress(Math.round(((i + 1) / data.length) * 100));
  
        if (response.status !== 200) {
          setFailedRecords((prev) => [
            ...prev,
            {
              CatchNumber: row.catchNumber,
              Status: 'Failed',
              Message: response.data.message || 'Unknown error',
            },
          ]);
        }
      } catch (error) {
        setFailedRecords((prev) => [
          ...prev,
          {
            CatchNumber: row.catchNumber,
            Status: 'Failed',
            Message: error.response?.data?.message || error.message,
          },
        ]);
      }
    }
  
    // Ensure final progress is 100%
    setProgress(100);
  
    setIsSubmitting(false); // End submission process
  
    // Toast notifications based on success/failure
    if (failedRecords.length === 0) {
      toast.success('All papers submitted successfully.');
    } else {
      toast.error('Some papers failed to submit. Check the failed records table.');
    }
  
    setFile(null);
    setData([]);
    setSelecedfile(false);
  };
  
  

  const handleCellChange = (e, rowIndex, key) => {
    const newValue = e.target.value;
    setData(prevData => {
      const newData = [...prevData];
      newData[rowIndex][key] = newValue;
      return newData;
    });
  };

  const headerMap = {
    catchNumber: 'Catch No.',
    courseName: 'Course',
    examType: 'Exam Type',
    subjectName: 'Subject',
    paperName: 'Paper Name',
    examDate: 'Exam Date',
    SN: 'SN'
  };

  return (
    <div>
      {!isSubmitting && (
        <>
        <ToastContainer/>
          <Form.Group className='mb-3'>
            <Form.Label>Import Bulk Paper Data (Excel)</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} accept=".xlsx, .csv" />
            {isFileReading && (
            <div className='d-flex justify-content-center my-3'>
              <Spinner animation='border' variant='primary' />
              <span className='ms-2'>Reading file...</span>
            </div>
          )}
          </Form.Group>
          {data.length > 0 && (
            <div>
              <Table striped bordered hover ref={tableRef}>
                <thead>
                  <tr>
                    {Object.keys(data[0])
                      .filter(header => !header.endsWith('ID') && header !== 'bookletSize')
                      .map((header, index) => (
                        <th key={index} className='text-center align-middle'>{headerMap[header]}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.entries(row)
                        .filter(([key]) => !key.endsWith('ID') && key !== 'bookletSize')
                        .map(([key, value], index) => (
                        <td key={index}>
                          {key === 'subjectName' && (
                            <>
                              <Form.Control
                                type="text"
                                value={value}
                                onChange={(e) => handleCellChange(e, rowIndex, key)}
                                style={{ backgroundColor: !value ? '#FFB9AA' : 'inherit' }}
                              />
                              {!matchSubject(value) && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAddSubject(value)}
                                  disabled={!value}
                                >
                                  Add
                                </Button>
                              )}
                            </>
                          )}

                          {key === 'courseName' && (
                            <>
                              <Form.Control
                                type="text"
                                value={value}
                                onChange={(e) => handleCellChange(e, rowIndex, key)}
                                style={{ backgroundColor: !value ? '#FFB9AA' : 'inherit' }}
                              />
                              {!matchCourse(value) && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAddCourse(value)}
                                  disabled={!value}
                                >
                                  Add
                                </Button>
                              )}
                            </>
                          )}

                          {key === 'examType' && (
                            <>
                              {!value && (
                                <span className='text-center text-danger'>Required<sup>*</sup></span>
                              )}
                              <Form.Control
                                type="text"
                                value={value}
                                onChange={(e) => handleCellChange(e, rowIndex, key)}
                                style={{ borderColor: !value ? '#FFB9AA' : '#dadada' }}
                              />
                            </>
                          )}

                          {key !== 'subjectName' && key !== 'courseName' && key !== 'examType' && (
                            <Form.Control disabled={key === 'SN'} type="text" value={value} onChange={(e) => handleCellChange(e, rowIndex, key)} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button className='btn btn-primary' onClick={handleSubmitdata}>Add Papers</Button>
            </div>
          )}
        </>
      )}


        <div>
          <ProgressBar now={progress} label={`${progress}%`} className='mt-3' />
          
          {failedRecords.length > 0 && (
            <div className='mt-4'>
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="text-danger">Failed Records:</h5>
                <div>
                  <Badge bg="secondary" className='ms-2'>Total: {totalRecords}</Badge>
                  <Badge bg="success" className='ms-2'>Success: {submittedRecords}</Badge>
                  <Badge bg="danger" className='ms-2'>Failed: {totalRecords - submittedRecords}</Badge>
                </div>

                <DownloadFailedRecords failedRecords={failedRecords} />
              </div>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    {Object.keys(failedRecords[0]).map((key, index) => (
                      <th key={index}>{headerMap[key] || key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {failedRecords.map((record, index) => (
                    <tr key={index}>
                      {Object.values(record).map((value, idx) => (
                        <td key={idx}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>

    </div>
  );
};

ImportData.propTypes = {
  programmeID: PropTypes.number.isRequired,
  setSelecedfile: PropTypes.func.isRequired,
  bookletSize: PropTypes.number.isRequired,
};

export default ImportData;
