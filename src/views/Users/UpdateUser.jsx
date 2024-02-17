import axios from "axios";
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";

const apiUserById = process.env.REACT_APP_API_USER_BY_ID;

const UpdateUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    // user_ID: userId,
    // firstName: "",
    // middleName: "",
    // lastName: "",
    // emailAddress: "",
    // phoneNumber: "",
    // designation: "",
  });

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleCloseErrorAlert = () => {
    setShowErrorAlert(false);
  };

  const handleCloseSuccessAlert = () => {
    setUpdateSuccess(false);
  };

  useEffect(() => {
    axios
      .get(`${apiUserById}/${userId}`)
      .then((res) => {
        const user = res.data;
        setUserData(res.data)
        // setUserData({
        //   user_ID: userId,
        //   firstName: user.firstName,
        //   middleName: user.middleName,
        //   lastName: user.lastName,
        //   emailAddress: user.emailAddress,
        //   phoneNumber: user.phoneNumber,
        //   designation: user.designation,
        // });
      })
      .catch((err) => setApiError(err.message || "An error occurred"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevUserData) => ({ ...prevUserData, [name]: value }));
    setShowErrorAlert(false);
    setUpdateSuccess(false);
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setShowErrorAlert(false);
    setUpdateSuccess(false);

    try {
      await axios.put(`${apiUserById}/${userId}`, userData);
      setUpdateSuccess(true);
      setUpdateSuccess(true);
      setApiError('');
      // Redirect immediately after success using navigate
      // navigate("/user-list");
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.error("Duplicate entry error:", error.response.data);
        setApiError("Email Already Exists!");
        setShowErrorAlert(true);
      } else {
        console.error("API error:", error);
        setApiError("An error occurred. Please try again later.");
        setShowErrorAlert(true);
      }
      // Set showSuccessAlert to false in case of error
      setUpdateSuccess(false);
    }
  };

  return (
    <Container className="userform border border-3 p-4 my-3">
      {loading && <p>Loading...</p>}
      {showErrorAlert && (
        <Alert variant="danger" onClose={handleCloseErrorAlert} dismissible>
          {apiError}
        </Alert>
      )}
      {updateSuccess && (
        <Alert
          variant="success"
          onClose={handleCloseSuccessAlert}
          dismissible
        >
          User updated successfully!
        </Alert>
      )}
      {!loading && (
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
                  value={userData.firstName}
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
                  value={userData.middleName}
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
                  value={userData.lastName}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3 row-cols-1 row-cols-md-2">
            <Col>
              <Form.Group controlId="formEmailAddress">
                <Form.Label>
                  <span className="text-danger">*</span> Email
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="emailAddress"
                  value={userData.emailAddress}
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
                  value={userData.phoneNumber}
                  onChange={handleChange}
                  required
                  minLength="10"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="row-cols-1">
            <Col>
              <Form.Group controlId="formDesignation" className="mt-3">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Designation"
                  name="designation"
                  value={userData.designation}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <hr />
          <div className="text-center">
            <Button variant="primary" type="submit">
              Update User
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default UpdateUser;
