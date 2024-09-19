//updated read line 88
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Button, ButtonGroup, Card, CardBody, Col, Container, Row } from "react-bootstrap";
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';
import { useSecurity } from './../../context/Security';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import './viewuser.css'
import { useUser } from "./../../context/UserContext";
import { useProfileImage } from './../../context/ProfileImageProvider';
import ActivityTable from "../dashboard/ActivityTable";

const permissionApi = process.env.REACT_APP_API_PERMISSION;
const baseUrl = process.env.REACT_APP_BASE_URL;

const apiUserbyid = process.env.REACT_APP_API_USER_BY_ID;
const apiPermissionsByUser = `${permissionApi}/ByUser`;
const apiModules = process.env.REACT_APP_API_MODULES;

const ViewUser = () => {
  const { keygenUser } = useUser();
  const { decrypt } = useSecurity();
  const { userId } = useParams();
  const decodedUserId = decrypt(userId);
  const { updateProfileImageUrl } = useProfileImage();

  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    designation: "",
    profilePicturePath: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState("permissions");
  const [datacount, setDataCount] = useState(100);

 
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`${apiUserbyid}/${decodedUserId}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        setUser(userResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchPermissions = async () => {
      try {
        const permissionsResponse = await axios.get(`${apiPermissionsByUser}/${decodedUserId}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        setPermissions(permissionsResponse.data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    const fetchModules = async () => {
      try {
        const modulesResponse = await axios.get(apiModules, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        setModules(modulesResponse.data);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };

 useEffect(() => {
    fetchUserData();
    fetchPermissions();
    fetchModules();
  }, [decodedUserId, keygenUser]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setSelectedImage(file);
    } else {
        alert('Please select a PNG, JPG, or JPEG image file.');
    }
};

// addedd new useEffect having function to check all module if any don't have permission post that as false.
// by shivom 18/09/24
useEffect(() => {
  if (!modules.length || !permissions.length) return;

  const missingPermissions = modules.filter(module => !permissions.some(p => p.moduleID === module.moduleID));
  if (missingPermissions.length > 0) {
    // Prepare the data to be sent
    const dataToSend = missingPermissions.map(module => ({
      userID: decodedUserId || 0, // Ensure you have the correct userID
      moduleID: module.moduleID,
      can_Add: false,
      can_Delete: false,
      can_Update: false,
      can_View: false
    }));

    axios.post(`${baseUrl}/api/permissions`, dataToSend, {
      headers: { 
        Authorization: `Bearer ${keygenUser?.token}`, 
        'Content-Type': 'application/json' 
      }
    })
    .then(response => {
      console.log('Default permissions posted successfully:', response.data);
      fetchPermissions()
    })
    .catch(error => {
      console.error('Error posting default permissions:', error);
    });
  }
}, [modules, permissions, keygenUser?.token, keygenUser?.userID, baseUrl]);
  useEffect(() => {
    const handleUpload = async () => {
      if (selectedImage) {
        setLoading(true);

        const formData = new FormData();
        formData.append('image', selectedImage);
        try {
          const response = await axios.post(`${baseUrl}/api/Users/upload/${decodedUserId}`, formData, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          setUser(prevUser => ({ ...prevUser, profilePicturePath: response.data.filePath }));
          updateProfileImageUrl(decodedUserId, `${baseUrl}/${response.data.filePath}`);
        } catch (error) {
          console.error('Error updating profile picture:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleUpload(); // Call handleUpload when selectedImage changes
  }, [selectedImage, keygenUser, decodedUserId]);

  const getModuleNameById = (moduleId) => {
    const module = modules.find(m => m.moduleID === moduleId);
    return module ? module.moduleName : 'Unknown';
  };

  const handlePermissionUpdate = (permissionId, field) => {
    const updatedPermissions = permissions.map(permission => {
      if (permission.permissionID === permissionId) {
        return { ...permission, [field]: !permission[field] };
      }
      return permission;
    });

    axios.put(`${permissionApi}/${permissionId}`, updatedPermissions.find(p => p.permissionID === permissionId), { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(res => {
        setPermissions(updatedPermissions);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <Card>
      <CardBody>
        <Row>
          <Col className="col-12 col-md-4 border-end">
            <Container className="my-4 text-center text-capitalize">
              <div className="upload">
                <img src={user.profilePicturePath ? `${baseUrl}/${user.profilePicturePath}?${new Date().getTime()}`.replace('wwwroot/', '') : DefaultAvatar} alt="" />
                <div className="round">
                  <input type="file" onChange={handleImageChange} />
                  <i className="fa fa-pencil" style={{ color: "#fff" }} ></i>
                </div>
              </div>
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
                        <th>Module Name</th>
                        <th>Can View</th>
                        <th>Can Add</th>
                        <th>Can Update</th>
                        <th>Can Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map(permission => (
                        <tr key={permission.permissionID}>
                          <td>{getModuleNameById(permission.moduleID)}</td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_View ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_View")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_View ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_View")}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_Add ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_Add")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_Add ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_Add")}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_Update ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_Update")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_Update ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_Update")}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_Delete ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_Delete")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_Delete ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permissionID, "can_Delete")}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "activities" && (
                <div className="text-center">
                  <ActivityTable datacount={datacount} userId={decodedUserId}/>
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
