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
  const [showBtn, setShowBtn] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState("permissions");

  useEffect(() => {
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
        const permissionsData = permissionsResponse.data;
        setPermissions(permissionsData);

        // Check if any module is missing permissions
        const missingPermissions = modules.filter(module => !permissionsData.some(permission => permission.moduleID === module.moduleID));
        if (missingPermissions.length > 0) {
          const postPermissions = missingPermissions.map(module => ({
            userId: decodedUserId,
            moduleID: module.moduleID,
            can_Add: false,
            can_View: false,
            can_Update: false,
            can_Delete: false,
          }));
          await axios.post(permissionApi, postPermissions, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          const updatedPermissionsResponse = await axios.get(`${apiPermissionsByUser}/${decodedUserId}`, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
          const updatedPermissionsData = updatedPermissionsResponse.data;
          setPermissions(updatedPermissionsData);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    const fetchModules = async () => {
      try {
        const modulesResponse = await axios.get(apiModules, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        const modulesData = modulesResponse.data;
        setModules(modulesData);
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };

    fetchUserData();
    fetchPermissions();
    fetchModules();
  }, [decodedUserId, modules, keygenUser]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setShowBtn(true);
  };

  const handleUpload = async () => {
    if (selectedImage) {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', selectedImage);

      try {
        const response = await axios.post(`${baseUrl}/api/Users/upload/${decodedUserId}`, formData, { headers: { Authorization: `Bearer ${keygenUser?.token}` } });
        setUser(prevUser => ({ ...prevUser, profilePicturePath: response.data.filePath }));
        setShowBtn(false);
      } catch (error) {
        console.error('Error updating profile picture:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getModuleNameById = (moduleId) => {
    const module = modules.find(m => m.moduleID === moduleId);
    return module ? module.moduleName : 'Unknown';
  };

  const handlePermissionUpdate = (permissionId, field) => {
    const updatedPermissionsCopy = permissions.map(permission => {
      if (permission.permissionID === permissionId) {
        return { ...permission, [field]: !permission[field] };
      }
      return permission;
    });

    axios.put(`${permissionApi}/${permissionId}`, updatedPermissionsCopy.find(p => p.permissionID === permissionId), { headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(res => {
        const updatedPermission = updatedPermissionsCopy.find(p => p.permissionID === permissionId);
        let updatedModulePermissions = updatedPermissionsCopy.filter(p => p.moduleID === updatedPermission.moduleID);

        if (field === "can_Delete" && updatedPermission.can_Delete) {
          updatedModulePermissions.forEach(p => {
            p.can_View = true;
            p.can_Add = true;
            p.can_Update = true;
            p.can_Delete = true;
          });
        } else if (field === "can_Update" && updatedPermission.can_Update) {
          updatedModulePermissions.forEach(p => {
            p.can_View = true;
            p.can_Add = true;
          });
        } else if (field === "can_Add" && updatedPermission.can_Add) {
          updatedModulePermissions.forEach(p => {
            p.can_View = true;
          });
        }

        setPermissions(updatedPermissionsCopy);
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