import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilEnvelopeOpen } from '@coreui/icons';
import { Col, Row, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { useUser } from './../../../context/UserContext';
import axios from 'axios';
import PageLayout from '../PageLayout/PageLayout';

// API endpoint for login from dotenv
const LoginApi = process.env.REACT_APP_API_LOGIN;

const Login = () => {
  // Access user context for login and user information
  const { login, keygenUser, isLoggedIn } = useUser();
  const navigate = useNavigate();

  // State variables for email, password, errors, and password visibility
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if the user is already logged in
    const checkUserAndRedirect = async () => {
      if (isLoggedIn()) {
        if (keygenUser.autoGenPass) {
          navigate('/ChangePassword');
        } else {
          navigate('/dashboard');
        }
      }
    };
    checkUserAndRedirect();
  }, [keygenUser, isLoggedIn, navigate]);

  const handleLogin = async () => {
    if (emailError || passwordError || !email || !password || loading) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(LoginApi, { email, password });

      if (response && response.data) {
        login(response.data);
      } else {
        console.error('Invalid API response', response);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setEmailError('');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (value) => {
    setEmail(value);
    setEmailError(!value ? 'Email is required' : !isEmailValid(value) ? 'Invalid email format' : '');
    setShowErrorAlert(false);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordError(!value ? 'Password is required' : '');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <PageLayout>
      {isLoggedIn() ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
          </Spinner>
        </div>
      ) : (
        <>
          <Form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <p >Sign In to your account</p>
            <div className="mb-3">
              {showErrorAlert && (
                <Alert
                  variant="danger"
                  onClose={() => setShowErrorAlert(false)}
                  dismissible className='align-items-center'
                >
                  Email or password you entered is incorrect
                </Alert>
              )}
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <CIcon icon={cilEnvelopeOpen} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Email Address"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  type="email"
                  isInvalid={!!emailError}
                  required
                />
                <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
              </InputGroup>
            </div>
            <div className="mb-4">
              <InputGroup hasValidation>
                <InputGroup.Text>
                  <CIcon icon={cilLockLocked} />
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  isInvalid={!!passwordError}
                  required
                />
                <InputGroup.Text onClick={togglePasswordVisibility} className='hovericon'>
                  {showPassword ? <i className="fa-solid fa-eye"></i> : <i className="fa-solid fa-eye-slash"></i>}
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
              </InputGroup>
            </div>
            <Row className='align-items-center'>
              <Col xs={12} sm={6} className='text-center text-sm-center text-md-start mb-2 mb-sm-0'>
                <Button typeof='submit' color="primary" className="px-4 w-100" onClick={handleLogin} disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                  Login
                </Button>
              </Col>
              <Col xs={12} sm={6} className='text-center text-sm-center text-md-end'>
                <Link to={'/ForgotPassword'} className="d-block">Forgot password?</Link>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </PageLayout>
  );
};

export default Login;
