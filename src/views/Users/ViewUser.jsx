import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Button, ButtonGroup, Card, CardBody, Col, Container, Image, Row } from "react-bootstrap";
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';

const apiUserbyid = process.env.REACT_APP_API_USER_BY_ID;

const ViewUser = () => {
  const { userId } = useParams();
  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    designation: "",
    profilePicturePath: "",
  });
  const address = "My Address";
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  const [, forceUpdate] = useState();

  useEffect(() => {
    // Fetch user data based on userId and update the state
    axios.get(`${apiUserbyid}/${userId}`)
      .then(res => {
        const userData = res.data;
        setUser(userData);
      })
      .catch(err => console.log(err));
  }, [userId, user.profilePicturePath]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setShowBtn(true)
  };

  const handleUpload = () => {
    console.log('upload called')
    if (selectedImage) {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', selectedImage);

      axios.post(`https://localhost:7247/api/Users/upload/${userId}`, formData)
        .then(response => {
          console.log('Profile picture updated successfully:', response.data);
          setUser(prevUser => ({ ...prevUser, profilePicturePath: response.data.filePath }));
          forceUpdate();
          setShowBtn(false) // Trigger a re-render to update the profile picture
        })
        .catch(error => {
          setShowBtn(false)
          console.error('Error updating profile picture:', error);
        })
        .finally(() => {
          setLoading(false);
          setShowBtn(false)
        });
    }
  };

  return (
    <Card>
      <CardBody>
        <Row>
          <Col className="col-12 col-md-4 border-end">
            <Container className="my-4 text-center text-capitalize">
              <div className="upload">
                <img src={user.profilePicturePath ? `https://localhost:7247/${user.profilePicturePath}?${new Date().getTime()}` : DefaultAvatar}
                  alt="" />
                <div className="round">
                  <input type="file" onChange={handleImageChange} />
                  <i className="fa fa-pencil" style={{ color: "#fff" }} ></i>
                </div>
              </div>
              {showBtn && (
                <button className="btn btn-sm btn-primary" onClick={handleUpload} disabled={loading}>
                  {loading ? 'Loading...' : 'Submit'}
                </button>
              )}
              <h5>{`${user.firstName} ${user.middleName} ${user.lastName}`}</h5>
              <p style={{ lineHeight: '1' }}>{user.designation}</p>

            </Container>
            <hr />
            {/* Additional user details */}
            <div className="text-center" style={{ listStyleType: 'none' }}>
              <li className="fs-5">
                <Link to={`tel:${user.phoneNumber}`} style={{ textDecoration: 'none', color: '#333' }}>
                  <i className="fa-solid fa-phone text-primary me-2"></i>
                  {user.phoneNumber}
                </Link>
              </li>
              <li className="fs-5">
                <Link to={`mailto:${user.emailAddress}`} style={{ textDecoration: 'none', color: '#333' }}>
                  <i className="fa-solid fa-envelope text-primary me-2"></i>
                  {user.emailAddress}
                </Link>
              </li>
              <li className="fs-5">
                {address ? (
                  <>
                    <i className="fa-solid fa-location-dot text-primary me-2"></i>
                    {address}
                  </>
                ) : (
                  ""
                )}
              </li>
            </div>
          </Col>

          <Col className="col-12 col-md-8">
            <Row className="gap-1 p-1">
              <ButtonGroup className="mb-3 gap-1">
                <Button variant="outline-secondary" className="border rounded p-1 fw-bold">Permissions</Button>
                <Button variant="outline-secondary" className="border rounded p-1 fw-bold">Activities</Button>
              </ButtonGroup>
              <hr />
            </Row>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ViewUser;