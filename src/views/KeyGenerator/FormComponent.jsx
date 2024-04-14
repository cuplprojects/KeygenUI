//FormComponent.jsx

import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormDataComponent from './FormDataComponent';
import FileUpload from './FileUpload';
import ShuffleConfig from './ShuffleConfig';
import Select from 'react-select';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useUser } from './../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const FormComponent = ({ formSubmitted, setFormSubmitted }) => {
    const {keygenUser} = useUser();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState([]);
    const [selectedProgramme, setSelectedProgramme] = useState('');
    const [selectedPaper, setSelectedPaper] = useState('');
    const [Programmes, setProgrammes] = useState([]);
    const [papers, setPapers] = useState([]);
    const [selectedPaperData, setSelectedPaperData] = useState(null);
    const [bookletSize, setBookletSize] = useState(null);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);

    useEffect(() => {
        async function fetchProgrammes() {
            try {
                const response = await fetch(`${baseUrl}/api/Programmes`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });
                if (response.ok) {
                    const data = await response.json();
                    setProgrammes(data);
                } else {
                    console.error('Failed to fetch programmes:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching programmes:', error);
            }
        }
        fetchProgrammes();
    }, []);

    useEffect(() => {
        async function fetchPapers() {
            try {
                const response = await fetch(`${baseUrl}/api/Papers/Programme/${selectedProgramme.value}`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });
                if (response.ok) {
                    const data = await response.json();
                    const filteredPapers = data.filter((paper) => paper.keyGenerated === false);
                    setPapers(filteredPapers);
                    setSelectedPaperData(null);
                    console.log(filteredPapers)
                } else {
                    console.error('Failed to fetch papers:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching papers:', error);
            }
        }
        if (selectedProgramme.value) {
            fetchPapers();
        }
    }, [selectedProgramme]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${baseUrl}/api/ProgConfigs/Programme/${selectedProgramme.value}/${bookletSize}`,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setNumberOfQuestions(data[0].numberofQuestions);
                    setFormData(Array.from({ length: data[0].numberofQuestions }, (_, index) => ({
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

        if (selectedProgramme.value && bookletSize) {
            fetchData();
        }
    }, [selectedProgramme, bookletSize]);

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
    
        if (!selectedProgramme || !selectedPaper || !numberOfQuestions || formData.some(data => !data.page || !data.qNumber || !data.key)) {
            alert("Please ensure all required fields are filled out.");
            return;
        }
    
        const csvHeader = 'Page No.,Q#,Key';
        const csvData = [csvHeader, ...formData.map((data) => `${data.page},${data.qNumber},${data.key}`)].join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
    
        try {
            const formdataForSubmit = new FormData();
            formdataForSubmit.append('file', blob, `file_${Date.now()}.csv`);
            const url = `${baseUrl}/api/FormData?ProgID=${selectedProgramme.value}&CatchNumber=${selectedPaperData.catchNumber}&PaperID=${selectedPaperData.paperID}`;
            
            const response = await axios.post(url, formdataForSubmit, {
                headers: {
                    'Authorization': `Bearer ${keygenUser?.token}`,
                    'Content-Type': 'multipart/form-data' // Set content type to multipart/form-data
                }
            });
            // const responseData = await response.json();
            const responseData = await response.data;
            console.log(responseData)
    
            if (responseData != null) {
                console.log('File uploaded successfully!');
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
                                <Form.Label>Select Programme:<span className="text-danger">*</span></Form.Label>
                                <Select
                                    options={Programmes.map((program) => ({ value: program.programmeID, label: program.programmeName }))}
                                    value={selectedProgramme}
                                    onChange={setSelectedProgramme}
                                    placeholder="Select the Programme"
                                    isDisabled={!editing && formSubmitted}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label>Select Paper:<span className="text-danger">*</span></Form.Label>
                                <Select
                                    options={papers.map((paper) => ({ value: paper.paperID, label: paper.catchNumber }))}
                                    value={selectedPaper}
                                    onChange={(selectedOption) => {
                                        setSelectedPaper(selectedOption);
                                        const paperData = papers.find((paper) => paper.paperID === selectedOption.value);
                                        setSelectedPaperData(paperData);
                                        

                                        setBookletSize(paperData.bookletSize);
                                    }}
                                    
                                    placeholder="Select the Paper"
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
                        <Form.Label>Enter Number of Questions:<span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            value={numberOfQuestions}
                            onChange={handleNumberOfQuestionsChange}
                            min="0"
                            placeholder="Enter the number of questions"
                            required
                            disabled={true || formSubmitted}
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
                            <Form.Label>Fill Master Data:<span className="text-danger">*</span></Form.Label>
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
