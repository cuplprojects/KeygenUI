import React, { useState, useEffect } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useUser } from './../../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const ImportData = ({ programmeID, setSelecedfile, bookletSize }) => {
  const { keygenUser } = useUser();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchCourses();
  }, []);

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
    const file = e.target.files[0];
    if (!file) {
      setSelecedfile(false);
      return; // No file selected, do nothing
    }

    setFile(file);
    setSelecedfile(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = jsonData[0]; // Assume the first row contains headers
      const mappedData = [];

      // Map each row of the Excel data to the desired format
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const mappedRow = {};

        // Add serial number (SN) as the first column
        mappedRow.SN = i;

        // Check if headers match and fill data accordingly
        if (headers.includes('Catch No.')) {
          mappedRow.catchNumber = String(row[headers.indexOf('Catch No.')]);
        }
        
        if (headers.includes('Course')) {
          mappedRow.courseName = row[headers.indexOf('Course')];
        }
        if (headers.includes('Exam Type')) {
          mappedRow.examType = row[headers.indexOf('Exam Type')];
        }
        if (headers.includes('Subject')) {
          mappedRow.subjectName = row[headers.indexOf('Subject')];
        }
        if (headers.includes('Paper Name')) {
          mappedRow.paperName = row[headers.indexOf('Paper Name')];
        }

        if (headers.includes('Exam Date & Time')) {
          const examDateTimeString = row[headers.indexOf('Exam Date & Time')];
          const examDateTime = new Date(examDateTimeString);
          if (!isNaN(examDateTime.getTime())) {
            mappedRow.examDate = examDateTime.toISOString();
          } else {
            mappedRow.examDate = null; // or handle invalid date
          }
        }
        

        mappedData.push(mappedRow);
      }

      setData(mappedData);
    };

    reader.readAsArrayBuffer(file); // Read the file as an array buffer
  };

  const handleSubmitdata = async (e) => {
    e.preventDefault();
    if (!programmeID || !bookletSize || data.some(row => !row.catchNumber) || data.some(row => !row.paperName)) {
      alert('Please fill in all required fields.');
      return;
    }
    // Convert data to JSON format for submission
    const formattedData = data.map(row => {
      // Destructure the row to remove the 'SN' field
      const { SN,subjectName,courseName, ...newRow } = row;
      // Add the 'createdByID' field
      const subject = subjects.find((subject) => subject.subjectName?.replace(/[.\s-]/g, '').toLowerCase() === row.subjectName?.replace(/[.\s-]/g, '').toLowerCase());
      const course = courses.find((course) => course.courseName?.replace(/[.\s-]/g, '').toLowerCase() === row.courseName?.replace(/[.\s-]/g, '').toLowerCase());
      console.log(typeof(newRow.catchNumber));
      return {
        ...newRow,
        createdByID: keygenUser?.userID,
        programmeID: programmeID,
        bookletSize: bookletSize,
        subjectID: subject?.subjectID || 0,
        courseID: course?.courseID || 0,
       
      };
    });

    const jsonData = JSON.stringify(formattedData);
    console.log(jsonData);

    try {
      const addResponse = await axios.post(`${baseUrl}/api/Papers`, jsonData, {
        headers: {
          Authorization: `Bearer ${keygenUser?.token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', addResponse.data);
      // Add any logic to handle the response here
    } catch (error) {
      console.error('Error:', error);
      // Add any error handling logic here
    }
  };

  const handleCellChange = (e, rowIndex, cellIndex) => {
    const newValue = e.target.value;
    setData(prevData => {
      const newData = [...prevData];
      newData[rowIndex][cellIndex] = newValue;
      return newData;
    });
  };

  return (
    <div>
      <Form.Group className='mb-3'>
        <Form.Label>Import File</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} accept=".xlsx, .csv" />
      </Form.Group>
      {data.length > 0 && (
        <div>
          <Table striped bordered hover>
            <thead>
              <tr>
                {Object.keys(data[0]).map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td key={cellIndex} style={{ backgroundColor: (key === 'catchNumber' || key === 'paperName') && !value ? '#FFB9AA' : 'inherit' }}>
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

                      {key !== 'subjectName' && key !== 'courseName' && (
                        <Form.Control disabled={key === 'SN'} type="text" defaultValue={value} onChange={(e) => handleCellChange(e, rowIndex, key)} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          <button className='btn btn-primary' onClick={handleSubmitdata}>Submit Data</button>
        </div>
      )}
    </div>
  );
};

ImportData.propTypes = {
  programmeID: PropTypes.number.isRequired,
  setSelecedfile: PropTypes.func.isRequired,
  bookletSize: PropTypes.number.isRequired,
};

export default ImportData;
