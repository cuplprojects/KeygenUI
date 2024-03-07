import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Button, ButtonGroup, Card, CardBody, Col, Container, Row } from "react-bootstrap";
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';
import { useSecurity } from './../../context/Security';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import './viewuser.css'

const permissionApi = process.env.REACT_APP_API_PERMISSION;
const baseUrl = process.env.REACT_APP_BASE_URL;

const apiUserbyid = process.env.REACT_APP_API_USER_BY_ID;
const apiPermissionsByUser = `${permissionApi}/ByUser`;
const apiModules = process.env.REACT_APP_API_MODULES;

const ViewUser = () => {
  const { decrypt } = useSecurity();
  const { userId } = useParams();
  const decodedUserId = decrypt(userId);

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
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState("permissions");

  useEffect(() => {
    // Fetch user data based on userId and update the state
    axios.get(`${apiUserbyid}/${decodedUserId}`)
      .then(res => {
        const userData = res.data;
        setUser(userData);
      })
      .catch(err => console.log(err));

    // Fetch permissions for the user
    axios.get(`${apiPermissionsByUser}/${decodedUserId}`)
      .then(res => {
        const permissionsData = res.data;
        setPermissions(permissionsData);
      })
      .catch(err => console.log(err));

    // Fetch modules for the user
    axios.get(apiModules)
      .then(res => {
        const modulesData = res.data;
        setModules(modulesData);
      })
      .catch(err => console.log(err));
  }, [decodedUserId]);

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

      axios.post(`${baseUrl}/api/Users/upload/${decodedUserId}`, formData)
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

  // Function to get module name based on module ID
  const getModuleNameById = (moduleId) => {
    const module = modules.find(m => m.module_Id === moduleId);
    return module ? module.module_Name : 'Unknown';
  };

  const handlePermissionUpdate = (permissionId, field) => {
    let updatedPermissions = [...permissions];
  
    // Update the permission
    updatedPermissions = updatedPermissions.map(permission => {
      if (permission.permission_Id === permissionId) {
        return { ...permission, [field]: !permission[field] };
      }
      return permission;
    });
  
    // Get the module ID for the updated permission
    const updatedPermission = updatedPermissions.find(p => p.permission_Id === permissionId);
    if (updatedPermission) {
      const moduleId = updatedPermission.module_Id;
      const modulePermissions = updatedPermissions.filter(p => p.module_Id === moduleId);
  
      if (field === "can_Delete" && updatedPermission.can_Delete) {
        // Grant view, add, and update permissions if delete permission is granted
        modulePermissions.forEach(permission => {
          permission.can_View = true;
          permission.can_Add = true;
          permission.can_Update = true;
          permission.can_Delete = true;
        });
      } else if (field === "can_Update" && updatedPermission.can_Update) {
        // Grant view and add permissions if update permission is granted
        modulePermissions.forEach(permission => {
          permission.can_View = true;
          permission.can_Add = true;
        });
      } else if (field === "can_Add" && updatedPermission.can_Add) {
        // Grant view permission if add permission is granted
        modulePermissions.forEach(permission => {
          permission.can_View = true;
        });
      }
    }
  
    setPermissions(updatedPermissions);
  
    // Update permissions in the API
    axios.put(`${permissionApi}/${permissionId}`, updatedPermissions.find(p => p.permission_Id === permissionId))
      .then(res => {
        // console.log("Permission updated successfully");
      })
      .catch(err => console.log(err));
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
                        <th>Module Name</th>
                        <th>Can View</th>
                        <th>Can Add</th>
                        <th>Can Update</th>
                        <th>Can Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map(permission => (
                        <tr key={permission.permission_Id}>
                          <td>{getModuleNameById(permission.module_Id)}</td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_View ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_View")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_View ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_View")}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_Add ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_Add")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_Add ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_Add")}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_Update ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_Update")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_Update ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_Update")}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="toggle-button">
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                className={`text-success toggle-icon ${permission.can_Delete ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_Delete")}
                              />
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                className={`text-danger toggle-icon ${!permission.can_Delete ? 'active' : ''}`}
                                onClick={() => handlePermissionUpdate(permission.permission_Id, "can_Delete")}
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
                  <p>No Activity Detected</p>
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
