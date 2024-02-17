import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import FormDataComponent from './FormDataComponent';
import FileUpload from './FileUpload';
import ShuffleConfig from './ShuffleConfig';

const FormComponent = ({ formSubmitted, setFormSubmitted }) => {
    const [editing, setEditing] = useState(false);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [formData, setFormData] = useState([]);
    const [universityName, setUniversityName] = useState('');
    const [paperCode, setPaperCode] = useState('');
    const [universities, setUniversities] = useState([]);

    useEffect(() => {
        async function fetchUniversities() {
            try {
                const response = await fetch('https://localhost:7247/api/Universities');
                if (response.ok) {
                    const data = await response.json();
                    setUniversities(data);
                } else {
                    console.error('Failed to fetch universities:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching universities:', error);
            }
        }
        fetchUniversities();
    }, []);

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

        if (!universityName || !paperCode || !numberOfQuestions || formData.some(data => !data.page || !data.qNumber || !data.key)) {
            alert("Please ensure all required fields are filled out.");
            return;
        }

        const csvHeader = 'Page No.,Q#,Key';
        const csvData = [csvHeader, ...formData.map((data) => `${data.page},${data.qNumber},${data.key}`)].join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });

        try {
            const formdataForSubmit = new FormData();
            formdataForSubmit.append('file', blob, `file_${Date.now()}.csv`);

            const url = `https://localhost:7247/api/FormData?UniversityName=${encodeURIComponent(universityName)}&PaperCode=${encodeURIComponent(paperCode)}`;

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
                    <Form.Group className='mb-2'>
                        <Form.Label><span className="text-danger">*</span>Enter University Name:</Form.Label>
                        <Form.Control
                            as="select"
                            value={universityName}
                            onChange={(e) => setUniversityName(e.target.value)}
                            placeholder="Select the name of the university"
                            required
                            disabled={!editing && formSubmitted}
                        >
                            <option value="">Select University</option>
                            {universities.map((uni) => (
                                <option key={uni.id} value={uni.university_Name}>{uni.university_Name}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group >
                        <Form.Label><span className="text-danger">*</span>Enter Paper Code:</Form.Label>
                        <Form.Control
                            type="text"
                            value={paperCode}
                            onChange={(e) => setPaperCode(e.target.value)}
                            placeholder="Enter the paper code"
                            required
                            disabled={!editing && formSubmitted}
                        />
                    </Form.Group>

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
                            <Button onClick={handleEdit}>Edit Form</Button>
                        )}
                    </div>
                </Form>
                {numberOfQuestions > 0 && !editing && formSubmitted && (
                    <ShuffleConfig />
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

export default FormComponent;
