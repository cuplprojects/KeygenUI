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
    const { keygenUser } = useUser();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState([]);
    const [Programmes, setProgrammes] = useState([]);
    const [selectedProgramme, setSelectedProgramme] = useState('');
    const [selectedPaper, setSelectedPaper] = useState('');
    const [papers, setPapers] = useState([]);
    const [selectedPaperData, setSelectedPaperData] = useState(null);
    const [bookletSize, setBookletSize] = useState(null);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [editedBookletSize, setEditedBookletSize] = useState(null);
    const [noconfigError, setNoconfigError] = useState("");
    const [loading, setLoading] = useState(false);
    const [pagematcherror, setPageMatchError] = useState("");
    const [excelfile, setExcelFile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${baseUrl}/api/FormData?progID=${selectedPaperData.programmeID}&CatchNumber=${selectedPaperData.catchNumber}&PaperID=${selectedPaperData.paperID}`,
                    { headers: { Authorization: `Bearer ${keygenUser?.token}` } }
                );
                const transformedData = response.data.map((item, index) => ({
                    key: item.answer,
                    page: item.pageNumber,
                    qNumber: item.questionNumber,
                    sn: index + 1
                }));
                if (transformedData.length > 0) {
                    setFormData(transformedData);
                    setBookletSize(selectedPaper.bookletSize);
                    setFormSubmitted(true);
                    setEditing(false);
                    setLoading(true);
                }
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        };
        if (selectedPaperData) {
            fetchData();
        }

    }, [selectedPaperData, keygenUser?.token, setFormSubmitted, selectedPaper.bookletSize]);


    useEffect(() => {
        async function fetchProgrammes() {
            try {
                const response = await fetch(`${baseUrl}/api/Programmes`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
                if (response.ok) {
                    const data = await response.json();
                    setProgrammes(data);

                    const selectedProgrammeFromStorage = sessionStorage.getItem('selectedProgramme');
                    if (selectedProgrammeFromStorage) {
                        const parsedProgramme = JSON.parse(selectedProgrammeFromStorage);
                        setSelectedProgramme(parsedProgramme);
                    }

                } else {
                    console.error('Failed to fetch programmes:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching programmes:', error);
            }
        }
        fetchProgrammes();
    }, [keygenUser?.token]);


    useEffect(() => {
        async function fetchPapers() {
            try {
                const response = await fetch(`${baseUrl}/api/Papers/Programme/${selectedProgramme.value}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
                if (response.ok) {
                    const data = await response.json();
                    const filteredPapers = data.filter((paper) => paper.keyGenerated === false);
                    setPapers(filteredPapers);
                    setSelectedPaperData(null);
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
    }, [selectedProgramme, keygenUser?.token]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${baseUrl}/api/ProgConfigs/Programme/${selectedProgramme.value}/${bookletSize}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
                if (response.ok) {
                    const data = await response.json();
                    setNumberOfQuestions(data[0].numberofQuestions);
                    setNoconfigError("");
                    setFormData(Array.from({ length: data[0].numberofQuestions }, (_, index) => ({
                        sn: index + 1,
                        page: '',
                        qNumber: '',
                        key: '',
                    })));
                } else {
                    setNoconfigError("No Configuration found for this paper.");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        if (selectedProgramme.value && bookletSize) {
            fetchData();
        }
    }, [selectedProgramme, bookletSize]);

    useEffect(() => {
        let timeoutId;
        async function updatePaperData() {
            try {
                const response = await axios.put(
                    `${baseUrl}/api/Papers/${selectedPaperData.paperID}`,
                    {
                        paperID: selectedPaperData.paperID,
                        programmeID: selectedPaperData.programmeID,
                        paperName: selectedPaperData.paperName,
                        catchNumber: selectedPaperData.catchNumber,
                        paperCode: selectedPaperData.paperCode,
                        courseID: selectedPaperData.courseID,
                        examType: selectedPaperData.examType,
                        subjectID: selectedPaperData.subjectID,
                        paperNumber: selectedPaperData.paperNumber,
                        examDate: selectedPaperData.examDate,
                        numberofQuestion: selectedPaperData.numberofQuestion,
                        bookletSize: editedBookletSize,
                        createdAt: selectedPaperData.createdAt,
                        createdByID: selectedPaperData.createdByID,
                        masterUploaded: selectedPaperData.masterUploaded,
                        keyGenerated: selectedPaperData.keyGenerated
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${keygenUser?.token}`,
                        },
                    }
                );
                const updatedPaperData = {
                    ...selectedPaperData,
                    bookletSize: editedBookletSize,
                };
                setBookletSize(editedBookletSize)
                setSelectedPaperData(updatedPaperData);
                // setFormData([])
            } catch (error) {
                console.error("Error updating paper data:", error);
            }
        }

        if (editedBookletSize !== bookletSize) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(updatePaperData, 500);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [editedBookletSize]);

    useEffect(() => {
        if ((formData.length > 0 && formData[formData.length - 1].page !== "") && (formData[formData.length - 1].page + 2) != editedBookletSize) {
            setPageMatchError("Booklet size and page in Excel do not match.");
        } else {
            setPageMatchError("");
        }
    }, [editedBookletSize, formData]);

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

            if (excelfile) {
                const reader = new FileReader();
                reader.readAsDataURL(excelfile);

                reader.onload = () => {
                    const binaryData = reader.result;
                    axios.post(`${baseUrl}/api/MasterKeyFile`, { paperID: selectedPaper.value, masterKeyFileData: binaryData }, {
                        headers: {
                            Authorization: `Bearer ${keygenUser?.token}`
                        }
                    });
                };
            }

            const url = `${baseUrl}/api/FormData?ProgID=${selectedProgramme.value}&CatchNumber=${selectedPaperData.catchNumber}&PaperID=${selectedPaperData.paperID}`;
            setLoading(true);

            const response = await axios.post(url, formdataForSubmit, {
                headers: {
                    'Authorization': `Bearer ${keygenUser?.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const responseData = response.data;
            console.log(responseData ? 'File uploaded successfully!' : 'File upload failed.');
            setFormSubmitted(responseData !== null);
            setEditing(false);

        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    
    const resetFormState = () => {
        setFormData([]);
        setSelectedPaper('');
        setPapers([]);
        setSelectedPaperData(null);
        setBookletSize(null);
        setNumberOfQuestions(0);
        setEditedBookletSize(null);
        setNoconfigError("");
        setLoading(false);
    };

    // Call resetFormState wherever needed to clear all state values
    // For example, in SelectedProgrammechange function:

    const SelectedProgrammechange = (selectedOption) => {
        resetFormState();

        setSelectedProgramme(selectedOption);

        // Store selected programme in sessionStorage
        sessionStorage.setItem('selectedProgramme', JSON.stringify(selectedOption));
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
                                <Form.Label>Select Program:<span className="text-danger">*</span></Form.Label>
                                <Select
                                    options={Programmes.map((program) => ({ value: program.programmeID, label: program.programmeName }))}
                                    value={selectedProgramme ? selectedProgramme : bookletSize}
                                    onChange={SelectedProgrammechange}
                                    placeholder="Select the Programme"
                                    isDisabled={!editing && formSubmitted}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group className='mb-2'>
                                <Form.Label>Select Catch Number:<span className="text-danger">*</span></Form.Label>
                                <Select
                                    options={papers.map((paper) => ({ value: paper.paperID, label: paper.catchNumber }))}
                                    value={selectedPaper}
                                    onChange={(selectedOption) => {
                                        setSelectedPaper(selectedOption);
                                        const paperData = papers.find((paper) => paper.paperID === selectedOption.value);
                                        setSelectedPaperData(paperData);
                                        setBookletSize(paperData.bookletSize);
                                        setEditedBookletSize(paperData.bookletSize);
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
                                    <Form.Label>Booklet Size</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={editedBookletSize}
                                        onChange={(e) => setEditedBookletSize(e.target.value)}
                                        min="0"
                                        placeholder="Enter the booklet size"
                                        required
                                        disabled={false || formSubmitted}
                                    />
                                    {formData.length > 0 && formData[formData.length - 1].page !== '' && (
                                        <>
                                            <Form.Label>Page in Excel: {formData[formData.length - 1].page + 2}</Form.Label>
                                        </>
                                    )}


                                </Form.Group>
                            </Col>
                            <div className="text-center">
                                {pagematcherror && <p className="text-danger">{pagematcherror}</p>}
                            </div>
                        </Row>
                        </>
                    )}
                    <hr />
                    <center className='text-primary fw-bold'><u>Input Master Data</u></center>

                    <FileUpload setExcelFile={setExcelFile} setFormData={setFormData} setNumberOfQuestions={setNumberOfQuestions} disabled={!editing && formSubmitted} />

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
                        <Button type="submit" disabled={!editing && formSubmitted && loading || pagematcherror !== ""}>
                            Upload and Save Master data
                        </Button>                        {!editing && formSubmitted && (
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
                {
                    noconfigError && (
                        <div className="d-flex align-items-center justify-content-center border border-2 border-danger" style={{ height: '100px' }}>
                            <p className='text-danger'>
                                {noconfigError} <br />
                                Pls. Check Program, Catch Number and Booklet Size.
                            </p>
                        </div>
                    )
                }
                {numberOfQuestions > 0 && noconfigError === "" && (
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
