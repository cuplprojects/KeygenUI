import React, { useState } from 'react';
import { Link} from 'react-router-dom';
import { cilLockLocked } from '@coreui/icons';
import {Col, Row, Form, InputGroup, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import CIcon from '@coreui/icons-react';
import { useUser } from './../../../context/UserContext';
import PageLayout from '../PageLayout/PageLayout';


const ChangePasswordApi = process.env.REACT_APP_API_CHANGE_PASSWORD;

const ChangePassword = () => {
  const { logout, keygenUser } = useUser();

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [passwordVisibility, setPasswordVisibility] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState({
    success: '',
    error: '',
  });

  // Handle password change input
  const handlePasswordChange = (field, value) => {
    setPasswords((prevPasswords) => ({ ...prevPasswords, [field]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [field]: value.trim() ? '' : `${field.charAt(0).toUpperCase() + field.slice(1)} is required` }));

    // Additional validation for alphanumeric and special character
    if (field === 'newPassword') {
      const alphanumericRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      setErrors((prevErrors) => ({
        ...prevErrors,
        newPassword: value.length < 8 ? 'New Password must be at least 8 characters long' : !alphanumericRegex.test(value)
          ? 'Password must contain at least one letter, one number, and one special character'
          : '',
      }));
    }

    // Clear alerts when typing in old password
    if (field === 'oldPassword') {
      setMessages({ success: '', error: '' });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prevVisibility) => ({ ...prevVisibility, [field]: !prevVisibility[field] }));
  };

  // Validate all passwords
  const validatePasswords = () => {
    const { oldPassword, newPassword, confirmNewPassword } = passwords;
    const newErrors = {};

    ['oldPassword', 'newPassword', 'confirmNewPassword'].forEach((field) => {
      if (!passwords[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (oldPassword.length < 0) {
      newErrors.newPassword = 'Old Password is Required';
    }

    if (newPassword.length < 8) {
      newErrors.newPassword = 'New Password must be at least 8 characters long';
    }

    if (confirmNewPassword !== newPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle change password button click
  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);

    try {
      const userId = keygenUser.userID; // Replace with the actual user ID
      const response = await axios.put(`${ChangePasswordApi}/${userId}`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      }, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });

      if (response.status === 200) {
        // Password change successful
        setMessages({ success: 'Your password has been changed. Please login again.', error: '' });

        // Logout after 3 seconds
        setTimeout(() => {
          logout();
        }, 3000);
      } else if (response.status === 400) {
        // Incorrect old password
        setMessages({ success: '', error: 'Enter Correct Old Password!' });
      } else {
        // Handle other status codes
        setMessages({ success: '', error: 'Password change failed. Please try again.' });
      }
    } catch (error) {
      // Network error or other issues
      setMessages({ success: '', error: 'Enter Correct Old Password!' });
    } finally {
      // Always set loading to false after the request is completed
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Form>
        <h1>Change Password</h1>
        <p>Change your password</p>
        {messages.success && <Alert variant="success">{messages.success}</Alert>}
        {messages.error && <Alert variant="danger">{messages.error}</Alert>}
        {['oldPassword', 'newPassword', 'confirmNewPassword'].map((field) => (
          <div key={field} className="mb-4">
            <InputGroup hasValidation>
              <InputGroup.Text>
                <CIcon icon={cilLockLocked} />
              </InputGroup.Text>
              <Form.Control
                type={passwordVisibility[field] ? 'text' : 'password'}
                placeholder={field === 'confirmNewPassword' ? 'Confirm New Password' : `${field.charAt(0).toUpperCase() + field.slice(1)}`}
                autoComplete={field === 'oldPassword' ? 'old-password' : 'new-password'}
                value={passwords[field]}
                onChange={(e) => handlePasswordChange(field, e.target.value)}
                isInvalid={!!errors[field]}
              />
              <InputGroup.Text onClick={() => togglePasswordVisibility(field)} className="hovericon">
                {passwordVisibility[field] ? <i className="fa-solid fa-eye"></i> : <i className="fa-solid fa-eye-slash"></i>}
              </InputGroup.Text>
              <Form.Control.Feedback type="invalid">{errors[field]}</Form.Control.Feedback>
            </InputGroup>
          </div>
        ))}
        <Row className="align-items-center">
          <Col xs={12} md={6} className="text-center text-md-start mb-2 mb-md-0">
            {/* Change Password Button */}
            <Button variant="primary" className="px-4 w-100" onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </Col>
          <Col xs={12} md={6} className="text-center text-md-end">
            {/* Back to Login Link */}
            <Link to="/login" className="d-block text-body-secondary">
              Back to Login
            </Link>
          </Col>
        </Row>
      </Form>
    </PageLayout>
  );
};

export default ChangePassword;
