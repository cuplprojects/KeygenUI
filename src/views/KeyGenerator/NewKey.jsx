import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import FormComponent from './FormComponent';

const NewKey = () => {
    const [formSubmitted, setFormSubmitted] = useState(false);

    return (
        <Container className="userform border border-3 p-4 my-3">
            <FormComponent formSubmitted={formSubmitted} setFormSubmitted={setFormSubmitted} />
        </Container>
    );
};

export default NewKey;
