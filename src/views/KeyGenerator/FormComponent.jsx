// FormComponent.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormDataComponent from './FormDataComponent';
import FileUpload from './FileUpload';
import ShuffleConfig from './ShuffleConfig';
import Select from 'react-select';
import PropTypes from 'prop-types';
const baseUrl = process.env.REACT_APP_BASE_URL;

const FormComponent = ({ formSubmitted, setFormSubmitted }) => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedPaper, setSelectedPaper] = useState('');
    const [groups, setGroups] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [papers, setPapers] = useState([]);
    const [selectedPaperData, setSelectedPaperData] = useState(null);
    const [bookletSize, setBookletSize] = useState(null);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetch(`${baseUrl}/api/Group`);
                if (response.ok) {
                    const data = await response.json();
                    setGroups(data);
                } else {
                    console.error('Failed to fetch groups:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        }
        fetchGroups();
    }, []);

    useEffect(() => {
        async function fetchSessions() {
            try {
                const response = await fetch(`${baseUrl}/api/Sessions`);
                if (response.ok) {
                    const data = await response.json();
                    setSessions(data);
                } else {
                    console.error('Failed to fetch sessions:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching sessions:', error);
            }
        }
        fetchSessions();
    }, []);

    useEffect(() => {
        async function fetchPapers() {
            try {
                const response = await fetch(`${baseUrl}/api/Papers/${selectedGroup.value}/${selectedSession.value}`);
                if (response.ok) {
                    const data = await response.json();
                    setPapers(data);
                    setSelectedPaperData(null);
                } else {
                    console.error('Failed to fetch papers:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching papers:', error);
            }
        }
        if (selectedGroup.value && selectedSession.value) {
            fetchPapers();
        }
    }, [selectedGroup, selectedSession]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${baseUrl}/api/PaperConfig/Group/Session?groupID=${selectedGroup.value}&sessionID=${selectedSession.value}&bookletsize=${bookletSize}`);
                if (response.ok) {
                    const data = await response.json();
                    setNumberOfQuestions(data.paperConfig.numberofQuestions);
                    setFormData(Array.from({ length: data.paperConfig.numberofQuestions }, (_, index) => ({
                        sn: index + 1,
                        page: '',
                        qNumber: '',
                        key: '',
                    })));
                } else {
                    console.error('Failed to fetch data:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        if (selectedGroup.value && selectedSession.value && bookletSize) {
            fetchData();
        }
    }, [selectedGroup, selectedSession, bookletSize]);

    const handleNumberOfQuestionsChange = (e) => {
        const inputNumber = e.target.value;
        const selectedNumber = parseInt(inputNumber, 10);
        const numberOfQuestionsValue = isNaN(selectedNumber) || inputNumber.trim() === '' ? '' : selectedNumber;
        setNumberOfQuestions(numberOfQuestionsValue);

        if (!isNaN(selectedNumber)) {
            setFormData(Array.from({ length: selectedNumber }, (_, index) => ({
                sn: index + 1,
                page: '',
                qNumber: '',
                key: '',
            })));
        } else {
            setFormData([]);
        }
    };

    const handleInputChange = (index, field, value) => {
        const updatedFormData = [...formData];
        updatedFormData[index][field] = value;
        setFormData(updatedFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedGroup || !selectedSession || !selectedPaper || !numberOfQuestions || formData.some(data => !data.page || !data.qNumber || !data.key)) {
            alert("Please ensure all required fields are filled out.");
            return;
        }

        const csvHeader = 'Page No.,Q#,Key';
        const csvData = [csvHeader, ...formData.map((data) => `${data.page},${data.qNumber},${data.key}`)].join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });

        try {
            const formdataForSubmit = new FormData();
            formdataForSubmit.append('file', blob, `file_${Date.now()}.csv`);

            const url = `${baseUrl}/api/FormData?GroupName=${encodeURIComponent(selectedGroup.label)}&PaperCode=${encodeURIComponent(selectedPaperData.paperCode)}&CatchNumber=${encodeURIComponent(selectedPaperData.catchNumber)}&SubjectID=${selectedPaperData.subjectID}`;

            const response = await fetch(url, {
                method: 'POST',
                body: formdataForSubmit,
            });

            const responseData = await response.text();

            if (response.ok) {
                console.log('File uploaded successfully!');
                localStorage.setItem('apiResponse', responseData);
                setFormSubmitted(true);
                setEditing(false);
            } else {
                console.error('File upload failed.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    return (
        <Row>
            <Col lg={6}>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label><span className="text-danger">*</span>Select Group:</Form.Label>
                                <Select
                                    options={groups.map((group) => ({ value: group.groupID, label: group.groupName }))}
                                    value={selectedGroup}
                                    onChange={setSelectedGroup}
                                    placeholder="Select the group"
                                    isDisabled={!editing && formSubmitted}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label><span className="text-danger">*</span>Select Session:</Form.Label>
                                <Select
                                    options={sessions.map((session) => ({ value: session.session_Id, label: session.session_Name }))}
                                    value={selectedSession}
                                    onChange={setSelectedSession}
                                    placeholder="Select the session"
                                    isDisabled={!editing && formSubmitted}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label><span className="text-danger">*</span>Select Paper:</Form.Label>
                                <Select
                                    options={papers.map((paper) => ({ value: paper.paperID, label: paper.catchNumber }))}
                                    value={selectedPaper}
                                    onChange={(selectedOption) => {
                                        setSelectedPaper(selectedOption);
                                        const paperData = papers.find((paper) => paper.paperID === selectedOption.value);
                                        setSelectedPaperData(paperData);
                                        setBookletSize(paperData.bookletSize);
                                    }}
                                    placeholder="Select the paper"
                                    isDisabled={!editing && formSubmitted}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {selectedPaperData && (
                        <><Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Paper Name</Form.Label>
                                    <Form.Control value={selectedPaperData.paperName} disabled />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Paper Code</Form.Label>
                                    <Form.Control value={selectedPaperData.paperCode} disabled />
                                </Form.Group>
                            </Col>
                        </Row>
                        </>
                    )}
                    <hr />
                    <center className='text-primary fw-bold'><u>Input Master Data</u></center>

                    <FileUpload setFormData={setFormData} setNumberOfQuestions={setNumberOfQuestions} disabled={!editing && formSubmitted} />

                    <center className='text-danger fw-bold'>OR</center>
                    <Form.Group>
                        <Form.Label><span className="text-danger">*</span>Enter Number of Questions:</Form.Label>
                        <Form.Control
                            type="number"
                            value={numberOfQuestions}
                            onChange={handleNumberOfQuestionsChange}
                            min="0"
                            placeholder="Enter the number of questions"
                            required
                            disabled={!editing && formSubmitted}
                        />
                    </Form.Group>
                    <div className="d-grid gap-2 mt-4">
                        <Button type="submit" disabled={!editing && formSubmitted}>Upload and Save CSV</Button>
                        {!editing && formSubmitted && (
                            // <Button onClick={handleEdit}>Edit Form</Button>
                            <></>
                        )}
                    </div>
                </Form>
                {numberOfQuestions > 0 && !editing && formSubmitted && (
                    <ShuffleConfig selectedPaperData={selectedPaperData} />
                )}
            </Col>

            <Col lg={6}>
                {numberOfQuestions > 0 && (
                    <Form className="rounded">
                        <Form.Group className='mt-2'>
                            <Form.Label><span className="text-danger">*</span>Fill Master Data:</Form.Label>
                            <FormDataComponent formData={formData} handleInputChange={handleInputChange} disabled={!editing && formSubmitted} />
                        </Form.Group>
                    </Form>
                )}
            </Col>
        </Row>
    );
};

FormComponent.propTypes = {
    formSubmitted: PropTypes.bool.isRequired,
    setFormSubmitted: PropTypes.func.isRequired
};

export default FormComponent;
