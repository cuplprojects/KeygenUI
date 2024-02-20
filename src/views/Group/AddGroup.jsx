import axios from "axios";
import React, { useState } from "react";
import { Form, Button, Row, Col, Container, Alert } from "react-bootstrap";

const AddGroup = () => {
  // API URL from environment variables
  const apiUrl = process.env.REACT_APP_API_GROUP;

  // State for form data
  const [formData, setFormData] = useState({
    groupID:0,
    groupName: "",
    region: "",
    city: "",
    address: ""
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
  const handlegroupSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Make API request to add Group
      const res = await axios.post(apiUrl, formData);
      console.log(res);
      // Show success alert
      setShowSuccessAlert(true);
      setShowErrorAlert(false);
      setErrorText("");
      // Clear form data after successful submission
      setFormData({
        groupID:0,
        groupName: "",
        region: "",
        city: "",
        address: ""
      });
    } catch (error) {
      if (error.response && error.response.status === 500) {
        // Handle 500 Internal Server Error (Duplicate Entry)
        console.error("Duplicate entry error:", error.response.data);
        setErrorText("Group Already Exists!");
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
          Group added successfully!
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

      <Form onSubmit={handlegroupSubmit}>
        <Row className="mt-3 row-cols-1 row-cols-md-3">
          <Col>
            <Form.Group controlId="formgroupName">
              <Form.Label>
                <span className="text-danger">*</span> Group Name
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formRegion">
              <Form.Label>
                <span className="text-danger">*</span> Region
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formCity">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="formAddress" className="mt-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter address"
            name="address"
            value={formData.address}
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
            {isLoading ? "Adding Group..." : "Add Group"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddGroup;
