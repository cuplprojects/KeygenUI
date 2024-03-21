import React, { useEffect, useRef, useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import $ from 'jquery';
import PropTypes from 'prop-types'; // Import PropTypes
const baseUrl = process.env.REACT_APP_BASE_URL;

const KeysTable = ({ keys }) => {
    const [filteredKeys, setFilteredKeys] = useState(keys);
    const [universityFilter, setUniversityFilter] = useState('');
    const [setFilter, setSetFilter] = useState('');
    const [paperCodeFilter, setPaperCodeFilter] = useState('');
    const [paperCodeOptions, setPaperCodeOptions] = useState([]);
    const [setOptions, setSetOptions] = useState([]);

    const tableRef = useRef(null);

    useEffect(() => {
        $(tableRef.current).DataTable();
    }, []);

    const parseAnswerKeyName = (name) => {
        const parts = name.split('_');
        const universityName = parts[0];
        const paperCode = parts[1];
        let setId = parts.length > 2 ? parts[2] : 'A';
        if (!isNaN(setId)) {
            setId = String.fromCharCode(65 + parseInt(setId) - 1);
        }
        return {
            universityName,
            paperCode,
            setId
        };
    };

    const filterKeys = () => {
        let filtered = keys.filter((key) => {
            const { universityName, paperCode, setId } = parseAnswerKeyName(key.answerKey_Name);
            return (universityFilter === '' || universityName === universityFilter) &&
                (setFilter === '' || setId === setFilter) &&
                (paperCodeFilter === '' || paperCode === paperCodeFilter);
        });
        setFilteredKeys(filtered);
    };

    const handleUniversityFilterChange = (event) => {
        const selectedUniversity = event.target.value;
        setUniversityFilter(selectedUniversity);
        const universityKeys = keys.filter(key => parseAnswerKeyName(key.answerKey_Name).universityName === selectedUniversity);
        const uniquePaperCodes = [...new Set(universityKeys.map(key => parseAnswerKeyName(key.answerKey_Name).paperCode))];
        setPaperCodeOptions(uniquePaperCodes);
        setSetOptions([]);
        setSetFilter('');
        setPaperCodeFilter('');
    };

    const handleSetFilterChange = (event) => {
        setSetFilter(event.target.value);
    };

    const handlePaperCodeFilterChange = (event) => {
        const selectedPaperCode = event.target.value;
        setPaperCodeFilter(selectedPaperCode);
        const universityKeys = keys.filter(key => parseAnswerKeyName(key.answerKey_Name).universityName === universityFilter);
        const paperCodeKeys = universityKeys.filter(key => parseAnswerKeyName(key.answerKey_Name).paperCode === selectedPaperCode);
        const uniqueSetIds = [...new Set(paperCodeKeys.map(key => parseAnswerKeyName(key.answerKey_Name).setId))];
        setSetOptions(uniqueSetIds);
        setSetFilter('');
    };

    const csvHeaders = [
        { label: 'Answer Key ID', key: 'answerKey_Id' },
        { label: 'University Name', key: 'universityName' },
        { label: 'Paper Code', key: 'paperCode' },
        { label: 'Set Identifier', key: 'setId' },
        { label: 'Answer Key File Path', key: 'answerKey_filePath' }
    ];

    const downloadFile = (filePath) => {
        const fullUrl = `${baseUrl}/${filePath.replace(/^wwwroot\//, '')}`;
        window.open(fullUrl);
    };

    useEffect(() => {
        filterKeys();
    }, [filterKeys]);
    
    return (
        <>
            <Form className="mb-3">
                <Row>
                    <Col>
                        <Form.Group controlId="universityFilter">
                            <Form.Label>Filter by University Name:</Form.Label>
                            <Form.Control as="select" value={universityFilter} onChange={handleUniversityFilterChange}>
                                <option value="">All</option>
                                {[...new Set(keys.map(key => parseAnswerKeyName(key.answerKey_Name).universityName))].map((university, index) => (
                                    <option key={index} value={university}>{university}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="paperCodeFilter">
                            <Form.Label>Filter by Paper Code:</Form.Label>
                            <Form.Control as="select" value={paperCodeFilter} onChange={handlePaperCodeFilterChange} disabled={!universityFilter}>
                                <option value="">All</option>
                                {paperCodeOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="setFilter">
                            <Form.Label>Filter by Set Identifier:</Form.Label>
                            <Form.Control as="select" value={setFilter} onChange={handleSetFilterChange} disabled={!universityFilter || !paperCodeFilter}>
                                <option value="">All</option>
                                {setOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <div className="table-responsive">
                <Table striped bordered hover ref={tableRef}>
                    <thead>
                        <tr>
                            <th>Answer Key ID</th>
                            <th>University Name</th>
                            <th>Paper Code</th>
                            <th>Set Identifier</th>
                            <th>Answer Key Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-center">
                        {filteredKeys.map((key) => {
                            const { universityName, paperCode, setId } = parseAnswerKeyName(key.answerKey_Name);
                            return (
                                <tr key={key.answerKey_Id}>
                                    <td>{key.answerKey_Id}</td>
                                    <td>{universityName}</td>
                                    <td>{paperCode}</td>
                                    <td>Set-{setId}</td>
                                    <td>{key.answerKey_Name}</td>
                                    <td>
                                        <div className="d-flex gap-3 text-primary">
                                            <Button variant="primary" onClick={() => downloadFile(key.answerKey_filePath)}>Download</Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
                <div className="d-flex justify-content-end mt-3">
                    <CSVLink
                        data={filteredKeys}
                        headers={csvHeaders}
                        filename={'keys_data.csv'}
                        className="btn btn-primary"
                    >
                        Download CSV
                    </CSVLink>
                </div>
            </div>
        </>
    );
};

KeysTable.propTypes = {
    keys: PropTypes.array.isRequired,
};


export default KeysTable;
