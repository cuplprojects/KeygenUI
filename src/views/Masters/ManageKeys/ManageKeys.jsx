import React, { useEffect, useState } from 'react';
import { useUser } from './../../../context/UserContext';
import Select from 'react-select';
import { Col, Row, Form, Card, Table, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatDateTime } from 'src/utils/DateFormate';

const apiUrl = process.env.REACT_APP_BASE_API_URL;

const ManageKeys = () => {
  const { keygenUser } = useUser();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedPaperData, setSelectedPaperData] = useState(null);
  const [nomaster, setNoMaster] = useState('');
  const [masterkey, setMasterKey] = useState([]);
  const [editMode, setEditMode] = useState(false); // State for edit mode
  const [editedAnswers, setEditedAnswers] = useState({}); // State to store edited answers
  const [editedDataRows, setEditedDataRows] = useState([]); // State to store edited data rows
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editedFields, setEditedFields] = useState(new Set()); // Set to track edited fields
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletedPaperID, setDeletedPaperID] = useState(null);

  useEffect(() => {
    async function fetchProgrammes() {
      try {
        const response = await fetch(`${apiUrl}/Programmes`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        if (response.ok) {
          const data = await response.json();
          setPrograms(data);

          // Check if there is a selected programme in sessionStorage
          const selectedProgrammeFromStorage = sessionStorage.getItem('selectedProgramme');
          if (selectedProgrammeFromStorage) {
            const parsedProgramme = JSON.parse(selectedProgrammeFromStorage);
            setSelectedProgram(parsedProgramme);
          }
        } else {
          console.error('Failed to fetch programmes:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching programmes:', error);
      }
    }
    fetchProgrammes();
  }, []);

  const handleProgramChange = (selectedOption) => {
    setSelectedProgram(selectedOption);
    setEditMode(false);
    setSelectedPaper(null);
    setSelectedPaperData(null);
    setPapers([])
    // Save selected programme to sessionStorage
    sessionStorage.setItem('selectedProgramme', JSON.stringify(selectedOption));
  };

  useEffect(() => {
    async function fetchPapers() {
      try {
        const response = await fetch(`${apiUrl}/Papers/Program/${selectedProgram?.value}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        if (response.ok) {
          const data = await response.json();
          const filteredPapers = data.filter(paper => paper.masterUploaded === true);
          setPapers(filteredPapers);
          setSelectedPaper(null);
          setSelectedPaperData(null);
        } else {
          console.error('Failed to fetch papers:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching papers:', error);
      }
    }
    if (selectedProgram && selectedProgram.value) {
      fetchPapers();
    }
  }, [selectedProgram, keygenUser]);

  useEffect(() => {
    if (selectedPaper) {
      const paperData = papers.find(paper => paper.paperID === selectedPaper.value);
      setSelectedPaperData(paperData);
      setEditMode(false);
      setEditedAnswers({})
      setEditedDataRows([])
      setEditedFields(new Set())
    } else {
      setSelectedPaperData(null);
    }
  }, [selectedPaper, papers]);

  useEffect(() => {


    if (selectedPaperData && selectedPaperData.masterUploaded) {
      fetchData();
    } else if (selectedPaperData && !selectedPaperData.masterUploaded) {
      setMasterKey([]);
      setNoMaster('Master Key Not Uploaded');
    }
    else {
      setMasterKey([]);
      setNoMaster('');
    }
  }, [selectedPaperData, keygenUser]);

  const fetchData = async () => {
    try {
      const keydata = await axios.get(`${apiUrl}/FormData/masterkeys?progID=${selectedPaperData.programmeID}&CatchNumber=${selectedPaperData.catchNumber}&PaperID=${selectedPaperData.paperID}`, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` }
      });
      if (keydata.data.length === 0) {
        setMasterKey([]);
        setNoMaster('Master Key Not Uploaded');
      } else {
        const filteredData = keydata.data.filter(item => item.setID === 1);
        setMasterKey(filteredData);
        setNoMaster('');
      }

    } catch (error) {
      console.log(error);
    }
  };



  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleAnswerChange = (e, questionNumber) => {
    const newEditedAnswers = { ...editedAnswers, [questionNumber]: e.target.value };
    setEditedAnswers(newEditedAnswers);
  

    // Add the questionNumber to editedFields set
    setEditedFields(new Set([...editedFields, questionNumber]));
  };

  const isFieldEdited = (questionNumber) => {
    return editedFields.has(questionNumber);
  };


  const handleConfirmUpdate = async () => {
    setShowConfirmation(false); // Hide the confirmation modal
    setEditMode(false);

    try {
      const response = await axios.post(`${apiUrl}/Keys/UpdateAnswers`, editedDataRows, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` }
      });

      if (response.status === 200) {
        setEditedDataRows([])
        setEditedAnswers({})
        setEditedFields(new Set())
        fetchData();
        console.log('Answers updated successfully.');
      } else {
        console.error('Failed to update answers:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating answers:', error);
    }
  };


  const handleDeleteClick = (paperID) => {
    setDeletedPaperID(paperID);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Perform deletion logic here, e.g., call an API to delete the paper
      const response = await axios.delete(`${apiUrl}/Keys?PaperID=${deletedPaperID}&catchNumber=${selectedPaperData.catchNumber}`, {
        headers: { Authorization: `Bearer ${keygenUser?.token}` }
      });

      if (response.status === 200) {
        fetchData()
        console.log(`Paper with ID ${deletedPaperID} has been deleted.`);
      } else {
        console.error('Failed to delete paper:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting paper:', error);
    }

    // Close the modal
    setShowDeleteConfirmation(false);
  };

  const handleSubmit = () => {
    const processedQuestionNumbers = new Set(); // Track processed question numbers
    const updatedRows = masterkey.map((item, index) => {
      const editedAnswer = editedAnswers[item.questionNumber];
      if (editedAnswer !== undefined && !processedQuestionNumbers.has(item.questionNumber)) {
        processedQuestionNumbers.add(item.questionNumber); // Add question number to processed set
        return {
          paperID: selectedPaperData.paperID,
          questionNumber: item.questionNumber,
          answer: editedAnswer,
          previousAnswer: item.answer,
        };
      }
      return null;
    }).filter(Boolean);
  
    // Filter out existing rows with the same paperID and questionNumber
    const filteredUpdatedRows = updatedRows.filter(updatedRow =>
      !editedDataRows.some(editedRow =>
        editedRow.paperID === updatedRow.paperID &&
        editedRow.questionNumber === updatedRow.questionNumber
      )
    );
  
    setEditedDataRows([...editedDataRows, ...filteredUpdatedRows]); // Append the new rows to the existing editedDataRows
    setShowConfirmation(true); // Show the confirmation modal
  };
  
  

  return (
    <>
      <Form>
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Select a Program:</Form.Label>
              <Select
                value={selectedProgram}
                onChange={handleProgramChange}
                options={programs.map(program => ({ value: program.programmeID, label: program.programmeName }))}
                placeholder="Select a program"
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Select a Paper:</Form.Label>
              <Select
                value={selectedPaper}
                onChange={setSelectedPaper}
                options={papers.map(paper => ({ value: paper.paperID, label: paper.catchNumber }))}
                placeholder="Select a paper"
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row className='mt-3'>
        <Col md={6} className='mb-3'>
          {nomaster && (
            <p className='text-center text-danger'>{nomaster}</p>
          )}
          {masterkey.length > 0 && (
            <Card>
              <Card.Header>
                <div className='d-flex align-items-center justify-content-between mx-4'>
                  <Card.Title className='text-center'>Master Key Data</Card.Title>
                  <span className='d-flex align-items-center justify-content-around gap-2'>
                    {editMode ? (
                      <>
                        <Button variant="primary" onClick={handleSubmit} disabled={Object.keys(editedAnswers).length === 0}>Submit</Button>
                      </>
                    ) : (
                      <Button variant='outline-primary' size='sm' onClick={handleEditClick}>
                        <FontAwesomeIcon icon={faPencil} />
                      </Button>
                    )}
                    <Button variant='outline-danger' size='sm' onClick={() => handleDeleteClick(selectedPaperData.paperID)} >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </span>
                </div>
              </Card.Header>
              <Card.Body>
                <Table className="table" striped bordered hover>
                  <thead>
                    <tr>
                      <th>Page Number</th>
                      <th>Question Number</th>
                      <th>Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterkey.map((item, index) => (
                      <tr key={index}>
                        <td>{item.pageNumber}</td>
                        <td>{item.questionNumber}</td>
                        <td>
                          {editMode ? (
                            <Form.Control
                              type="text"
                              value={editedAnswers[item.questionNumber] ?? item.answer}
                              onChange={(e) => handleAnswerChange(e, item.questionNumber)}
                              className={isFieldEdited(item.questionNumber) ? 'border-warning' : ''}
                            />
                          ) : item.answer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
        {selectedPaperData && (
          <Col md={6}>
            <Card>
              <Card.Header>
                <Card.Title className='text-center'>Paper Data</Card.Title>
              </Card.Header>
              <Card.Body>
              {selectedPaperData && selectedPaperData.masterUploaded && !selectedPaperData.keyGenerated && (
                  <p className='text-danger text-center'>
                  Master Uploded But Keys Not Generated.
                </p>
                )}
                <Table striped bordered hover>
                  <tbody>
                    <tr>
                      <td>Program:</td>
                      <td>{selectedPaperData.programmeName}</td>
                    </tr>
                    <tr>
                      <td>Catch Number:</td>
                      <td>{selectedPaperData.catchNumber}</td>
                    </tr>
                    <tr>
                      <td>Course:</td>
                      <td>
                        {
                          selectedPaperData.courseName
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>Exam Type:</td>
                      <td>
                        {selectedPaperData.examType}
                      </td>
                    </tr>
                    <tr>
                      <td>Subject:</td>
                      <td>
                        {selectedPaperData.subjectName}
                      </td>
                    </tr>
                    <tr>
                      <td>Paper Name:</td>
                      <td>
                        {selectedPaperData.paperName}
                      </td>
                    </tr>
                    <tr>
                      <td>Exam DateTime:</td>
                      <td>
                        {formatDateTime(selectedPaperData.examDate)}
                      </td>
                    </tr>
                    <tr>
                      <td>Booklet Size:</td>
                      <td>
                        {`${selectedPaperData.bookletSize} Pages`}
                      </td>
                    </tr>
                    <tr>
                      <td>Paper Created By:</td>
                      <td>{selectedPaperData.createdBy}</td>
                    </tr>
                    <tr>
                      <td>Paper Created DateTime:</td>
                      <td>{formatDateTime(selectedPaperData.createdAt)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to update the answers of all generated keys with the following changes?
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Question Number</th>
                <th>Previous Answer</th>
                <th>Updated Answer</th>
              </tr>
            </thead>
            <tbody>
              {editedDataRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.questionNumber}</td>
                  <td>{row.previousAnswer}</td>
                  <td>{row.answer}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmUpdate}>
            Confirm Update
          </Button>
        </Modal.Footer>
      </Modal>

      {showDeleteConfirmation && (
        <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Confirmation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete All the keys data releted to Catch Number {selectedPaperData.catchNumber}?
            <p> This action is irreversible.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default ManageKeys;
