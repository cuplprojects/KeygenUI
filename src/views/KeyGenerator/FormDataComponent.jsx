import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import axios from 'axios';
const baseApiUrl = process.env.REACT_APP_BASE_API_URL;

const FormDataComponent = ({ programId, numberOfQuestions, formData, setFormData, handleInputChange, disabled, catchNumber }) => {
    const [loading, setLoading] = useState(false); // Initialize loading state to false
    const handleKeyDown = (e, index, column) => {
        if (e.key === 'Tab' || e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault(); // Prevent default behavior of Tab/Enter keys
            const nextIndex = (index + 1) % formData.length; // Loop back to the first if at the last
            const nextInput = document.querySelector(`input[data-index='${nextIndex}'][data-column='${column}']`);
            if (nextInput) {
                nextInput.focus(); // Set focus to the next input field
            }
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault(); // Prevent default behavior of Tab/Enter keys
            const nextIndex = (index - 1 + formData.length) % formData.length; // Loop back to the last if at the first
            const nextInput = document.querySelector(`input[data-index='${nextIndex}'][data-column='${column}']`);
            if (nextInput) {
                nextInput.focus(); // Set focus to the next input field
            }
        }
    };

    // Function to handle download
    const handleDownload = async () => {
        try {
            const response = await fetch(`${baseApiUrl}/PdfData/MasterKeyTemplate/${programId}/${catchNumber}`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob(); // Get the response as a Blob
            const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
            const a = document.createElement('a'); // Create a temporary anchor element
            a.href = url;
            a.download = `${catchNumber}.xlsx`; // Set the download filename
            document.body.appendChild(a); // Append the anchor to the body
            a.click(); // Programmatically click the anchor to trigger the download
            a.remove(); // Remove the anchor from the document
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    useEffect(() => {
        if (catchNumber) {
            autofillPages();
        }
    }, [catchNumber]);

    // Function to autofill pages
    const autofillPages = async () => {
        setLoading(true);
        // Create initial form data with the correct number of rows
        const initialFormData = Array.from({ length: numberOfQuestions }, (_, index) => ({
            sn: (index + 1).toString(),
            page: "",
            qNumber: (index + 1).toString(),
            key: ""
        }));
        setFormData(initialFormData);
        
        try {
            const response = await axios.get(`${baseApiUrl}/PdfData/autofill?catchnumber=${catchNumber}&ProgramId=${programId}`);
            if (response.status === 200 && response.data.length > 0) {
                // Create a complete list of question numbers with the correct length
                const completeData = Array.from({ length: numberOfQuestions }, (_, index) => ({
                    sn: (index + 1).toString(),
                    page: "",
                    qNumber: (index + 1).toString(),
                    key: ""
                }));

                // Modified: Fill in the data from the response, matching by qNumber
                response.data.forEach(data => {
                    if (data.qNumber) {  // Check if qNumber exists
                        const qIndex = parseInt(data.qNumber, 10) - 1;
                        if (qIndex >= 0 && qIndex < numberOfQuestions) {
                            completeData[qIndex] = {
                                ...completeData[qIndex],
                                page: data.page?.toString() || "",  // Convert page to string if it exists
                                qNumber: data.qNumber.toString(),
                                key: data.key || "",
                                sn: (qIndex + 1).toString()
                            };
                        }
                    }
                });

                setFormData(completeData);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePast = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText(); // Read the clipboard text
            const lines = clipboardText.split('\n').filter((line, index, self) => index < self.length - 1 || self[self.length - 1].trim() !== ''); // Split the text by new lines and remove the last line if it's empty
            if (lines.length > numberOfQuestions) {
                alert('Data exceeds the number of questions')
                return;
            }

            const updatedFormData = formData.map((data, index) => {
                if (index < lines.length) {
                    return { ...data, key: lines[index].trim() }; // Fill in the 'key' field
                }
                return data; // Return the original data if no corresponding clipboard line exists
            });

            setFormData(updatedFormData.slice(0, numberOfQuestions)); // Ensure formData has only numberOfQuestions items
        } catch (error) {
            console.error('Paste failed:', error);
        }
    };

    return (
        <div className="table-wrapper" style={{ maxHeight: '70vh', overflowY: 'scroll' }}>
            <div className="mx-2 d-flex align-items-center justify-content-between">
                <Form.Label className='fw-bold'>Fill Master Data:</Form.Label>
                <div>
                    <Button size='sm' className='m-1' onClick={handleDownload} disabled={loading}>
                        <i className="fa fa-download" title="Download Template" />
                    </Button>
                    {/* <Button 
                        size='sm' 
                        className='m-1' 
                        onClick={autofillPages} // Attach autofillPages to button
                        disabled={loading} // Disable button while loading
                        title="Autofill Page Number"
                    >
                        {loading ? 'Loading...' : 'Autofill'}
                    </Button> */}
                </div>
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th className='text-center'>SN</th>
                        <th className='text-center'>Page No.<span className="text-danger">*</span></th>
                        <th className='text-center'>Question Number<span className="text-danger">*</span></th>
                        <th className='ps-3 text-center'>Key<span className="text-danger">*</span>  <i className="fa-solid fa-paste text-primary c-pointer ms-4" onClick={handlePast} title='Paste'></i></th>
                    </tr>
                </thead>
                <tbody>
                    {formData.slice(0, numberOfQuestions).map((data, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td> {/* Automatically assign serial number */}
                            <td>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    value={data.page}
                                    onChange={(e) => handleInputChange(index, 'page', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'page')}
                                    disabled={disabled}
                                    data-index={index}
                                    data-column="page"
                                    className='text-center'
                                />
                            </td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    value={(index + 1).toString()} // Question numbers from 1 to numberOfQuestions as string
                                    disabled={true} // Non-editable
                                    data-index={index}
                                    data-column="qNumber"
                                    className='text-center'
                                />
                            </td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    value={data.key}
                                    onChange={(e) => handleInputChange(index, 'key', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'key')}
                                    disabled={disabled}
                                    style={{ border: data.key.includes('*') ? '1px solid red' : '1px solid #ced4da' }}
                                    data-index={index}
                                    data-column="key"
                                    className='text-center fw-bold'
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

FormDataComponent.propTypes = {
    formData: PropTypes.array.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    catchNumber: PropTypes.string.isRequired, // Added catchNumber prop
    setFormData: PropTypes.func.isRequired, // Ensure setFormData is required
    programId: PropTypes.number.isRequired, // Ensure setFormData is required
    numberOfQuestions: PropTypes.number.isRequired, // Ensure setFormData is required
};

export default FormDataComponent;
