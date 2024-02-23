import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Button, ButtonGroup, Card, CardBody, Col, Container, Image, Row } from "react-bootstrap";
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';

const apiUserbyid = process.env.REACT_APP_API_USER_BY_ID;
const apiPermissionsByUser = 'https://localhost:7247/api/Permissions/ByUser';

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
  const [permissions, setPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState("permissions");

  useEffect(() => {
    // Fetch user data based on userId and update the state
    axios.get(`${apiUserbyid}/${userId}`)
      .then(res => {
        const userData = res.data;
        setUser(userData);
      })
      .catch(err => console.log(err));

    // Fetch permissions for the user
    axios.get(`${apiPermissionsByUser}/${userId}`)
      .then(res => {
        const permissionsData = res.data;
        setPermissions(permissionsData);
      })
      .catch(err => console.log(err));
  }, [userId]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setShowBtn(true);
  };

  const handleUpload = () => {
    if (selectedImage) {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', selectedImage);

      axios.post(`https://localhost:7247/api/Users/upload/${userId}`, formData)
        .then(response => {
          setUser(prevUser => ({ ...prevUser, profilePicturePath: response.data.filePath }));
          setShowBtn(false);
        })
        .catch(error => {
          console.error('Error updating profile picture:', error);
        })
        .finally(() => {
          setLoading(false);
          setShowBtn(false);
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
                <Button variant={activeTab === "permissions" ? "primary" : "outline-secondary"} className="border rounded p-1 fw-bold" onClick={() => setActiveTab("permissions")}>Permissions</Button>
                <Button variant={activeTab === "activities" ? "primary" : "outline-secondary"} className="border rounded p-1 fw-bold" onClick={() => setActiveTab("activities")}>Activities</Button>
              </ButtonGroup>
              <hr />
              {activeTab === "permissions" && (
                <div className="table-responsive">
                  <table className="table table-hover table-bordered align-middle text-center">
                    <thead>
                      <tr>
                        <th>Module ID</th>
                        <th>Can View</th>
                        <th>Can Add</th>
                        <th>Can Update</th>
                        <th>Can Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map(permission => (
                        <tr key={permission.permission_Id}>
                          <td>{permission.module_Id}</td>
                          <td>{permission.can_View ? "Yes" : "No"}</td>
                          <td>{permission.can_Add ? "Yes" : "No"}</td>
                          <td>{permission.can_Update ? "Yes" : "No"}</td>
                          <td>{permission.can_Delete ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "activities" && (
                <div className="text-center">
                  <p>Activities table content here (dummy data)</p>
                </div>
              )}
            </Row>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ViewUser;
