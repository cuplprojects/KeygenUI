import axios from "axios";
import React, { useState } from "react";
import { Form, Button, Row, Col, Container, Alert } from "react-bootstrap";

const AddUser = () => {
  // API URL from environment variables
  const apiUrl = process.env.REACT_APP_API_USER_BY_ID;

  // State for form data
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    designation: "",
    profilePicturePath:"",
  });

  // State for success alert
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // State for error alert
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // State for loading state of the button
  const [isLoading, setIsLoading] = useState(false);

  // State for error message text
  const [errorText, setErrorText] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Make API request to add user
      const res = await axios.post(apiUrl, formData);
      console.log(res);
      // Show success alert
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      setErrorText("");
      // Clear form data after successful submission
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        emailAddress: "",
        phoneNumber: "",
        designation: "",
        profilePicturePath:"",
      });
    } catch (error) {
      if (error.response && error.response.status === 500) {
        // Handle 500 Internal Server Error (Duplicate Entry)
        console.error("Duplicate entry error:", error.response.data);
        setErrorText("Email Already Exists!");
      } else {
        // Handle other errors
        console.error("API error:", error);
        setErrorText("An error occurred. Please try again later.");
      }
      // Show error alert
      setShowErrorAlert(true);
    } finally {
      // Reset loading state after submission
      setIsLoading(false);
    }
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      {showSuccessAlert && (
        <Alert
          variant="success"
          onClose={() => setShowSuccessAlert(false)}
          dismissible
        >
          User added successfully!
        </Alert>
      )}

      {showErrorAlert && (
        <Alert
          variant="danger"
          onClose={() => setShowErrorAlert(false)}
          dismissible
        >
          {errorText}
        </Alert>
      )}

      <Form onSubmit={handleUserSubmit}>
        <Row className="mt-3 row-cols-1 row-cols-md-3">
          <Col>
            <Form.Group controlId="formFirstName">
              <Form.Label>
              <span className="text-danger">*</span> First Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formMiddleName">
              <Form.Label>Middle Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter middle name"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-4 row-cols-1 row-cols-md-2">
          <Col>
            <Form.Group controlId="formEmailAddress">
              <Form.Label>
                <span className="text-danger">*</span> Email
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formPhoneNumber">
              <Form.Label>
                <span className="text-danger">*</span> Mobile Number
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter mobile number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                minLength="10"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="formDesignation" className="mt-3">
          <Form.Label>Designation</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
          />
        </Form.Group>

        <hr />

        <div className="text-center">
          <Button
            variant="primary"
            type="submit"
            className="mt-3"
            disabled={isLoading}
          >
            {isLoading ? "Adding User..." : "Add User"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddUser;
