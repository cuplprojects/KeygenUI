import axios from "axios";
import React, { useState } from "react";
import { Form, Button, Row, Col, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSecurity } from "./../../context/Security";
import { useUser } from "./../../context/UserContext";

const AddUser = () => {
  const {keygenUser} = useUser();
  const { encrypt } = useSecurity();
  const apiUrl = process.env.REACT_APP_API_USER_BY_ID;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    designation: "",
    profilePicturePath: "",
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(apiUrl,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } }, formData);
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      setErrorText("");
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        emailAddress: "",
        phoneNumber: "",
        designation: "",
        profilePicturePath: "",
      });

      navigate(`/users/AddPermissions/${encrypt(res.data.userID)}`);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.error("Duplicate entry error:", error.response.data);
        setErrorText("Email Already Exists!");
      } else {
        console.error("API error:", error);
        setErrorText("An error occurred. Please try again later.");
      }
      setShowErrorAlert(true);
    } finally {
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
                First Name <span className="text-danger">*</span>
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
                Email <span className="text-danger">*</span>
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
                Mobile Number <span className="text-danger">*</span>
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
