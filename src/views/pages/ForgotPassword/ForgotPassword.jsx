import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, InputGroup, Button, Col, Row, Alert, Spinner } from 'react-bootstrap';
import { cilEnvelopeOpen } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import axios from 'axios';
import PageLayout from '../PageLayout/PageLayout';

const ForgotPasswordApi = process.env.REACT_APP_API_FORGOT_PASSWORD;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [alertMessage, setAlertMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value) => {
    setEmail(value);
    setAlertMessage(false)
    setSuccessMessage(false);
    setEmailError(!value ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : '');
  };

  const handleResetPassword = async () => {
    if (emailError || !email || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(ForgotPasswordApi, { email, password: '-' }); // password
      if (response && response.data) {
        setSuccessMessage(true);
        setAlertMessage(false)
      } else {
        setAlertMessage(true)
        setSuccessMessage(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      // setAlertMessage(true) //Temprary
    }
  };

  return (
    <PageLayout>
      <Form>
        <h1>Forgot Password</h1>
        <p>Reset your password</p>
        {successMessage && (
          <Alert variant="success" className="mt-3">
            Password has been sent to your email address. Please check.
          </Alert>
        )}
        {alertMessage && (
          <Alert variant="danger" className="mt-3">
            Incorrect email address.
          </Alert>
        )}
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <CIcon icon={cilEnvelopeOpen} />
          </InputGroup.Text>
          <Form.Control className='rounded-end'
            type="email"
            placeholder="Email Address"
            autoComplete="Email Address"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            isInvalid={!!emailError}
          />
          <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
        </InputGroup>
        <Row className='align-items-center'>
          <Col xs={12} md={6} className='text-center text-md-start mb-2 mb-md-0'>
            {/* Reset Password Button */}
            <Button variant="primary" className="px-4 w-100" onClick={handleResetPassword} disabled={loading}>
              {loading && <Spinner animation="border" size="sm" className="me-2" />}
              Reset Password
            </Button>
          </Col>

          <Col xs={12} md={6} className='text-center text-md-end'>
            {/* Back to Login Link */}
            <Link to={'/login'} className="d-block">Back to Login</Link>
          </Col>
        </Row>
      </Form>
    </PageLayout>
  );
};

export default ForgotPassword;
