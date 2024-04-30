import React, { useState, useEffect } from 'react';
import { useUser } from './../../context/UserContext';
import { fetchUserData, updateProfilePicture } from './../../context/UserData';
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';
import { Accordion, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft, faKey, faLock, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useProfileImage } from './../../context/ProfileImageProvider'; // Import the context hook
import ActivityTable from '../dashboard/ActivityTable';
import ChangePasswordForm from '../pages/ChangePassword/ChangePasswordForm';

const BaseUrl = process.env.REACT_APP_BASE_URL;

const Profile = () => {
    const { keygenUser } = useUser();
    const [userData, setUserData] = useState(null);
    const [profilePicturePath, setProfilePicturePath] = useState(DefaultAvatar);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const { updateProfileImageUrl } = useProfileImage(); // Use the context hook

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (keygenUser) {
                    setLoading(true);
                    const userData = await fetchUserData(keygenUser.userID, keygenUser.token);
                    setUserData(userData);
                    setProfilePicturePath(userData.profilePicturePath ? `${BaseUrl}/${userData.profilePicturePath}?${new Date().getTime()}` : DefaultAvatar);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [keygenUser]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
    };

    useEffect(() => {
        const handleUpload = async () => {
            if (selectedImage && keygenUser) {
                setLoading(true);
                try {
                    await updateProfilePicture(keygenUser.userID, selectedImage, keygenUser.token);
                    const updatedUserData = await fetchUserData(keygenUser.userID, keygenUser.token);
                    setUserData(updatedUserData);
                    const newImageUrl = `${BaseUrl}/${updatedUserData.profilePicturePath}?${new Date().getTime()}`;
                    setProfilePicturePath(newImageUrl);
                    updateProfileImageUrl(keygenUser.userID, newImageUrl); // Update the profile image URL in the context
                } catch (error) {
                    console.error('Error updating profile picture:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        handleUpload(); // Call handleUpload when selectedImage or keygenUser changes
    }, [selectedImage, keygenUser]);

    return (
        <Container>
            {loading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : userData && (
                <Row>
                    <Col md={5} className="text-center">
                        <Card className="mx-auto w-100 p-3">
                            <Card.Body style={{ border: '2px dashed #dadada ' }}>
                                <div className="upload">
                                    <img src={profilePicturePath} alt="Profile" />
                                    <div className="round">
                                        <label htmlFor="file-input">
                                            <FontAwesomeIcon icon={faPencilAlt} style={{ color: "#fff" }} />
                                        </label>
                                        <input id="file-input" type="file" onChange={handleImageChange} />
                                    </div>
                                </div>
                                <Card.Title>{`${userData.firstName} ${userData.lastName}`}</Card.Title>
                                <Card.Text>
                                    Email: {userData.emailAddress}
                                </Card.Text>
                                <Card.Text>
                                    Phone: {userData.phoneNumber}
                                </Card.Text>
                                <Card.Text>
                                    Designation: {userData.designation}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={7}>
                        <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                    <FontAwesomeIcon icon={faLock} className='me-3' /> Security
                                </Accordion.Header>
                                <Accordion.Body className='rounded'>
                                    <Accordion defaultActiveKey="0">
                                        <Accordion.Item eventKey="3">
                                            <Accordion.Header>
                                                <FontAwesomeIcon icon={faKey} className='me-3' /> Change Password
                                            </Accordion.Header>
                                            <Accordion.Body className='rounded'>
                                                <ChangePasswordForm />
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1" className='mt-3 rounded'>
                                <Accordion.Header>
                                    <FontAwesomeIcon icon={faClockRotateLeft} className='me-3' /> Activity
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ActivityTable />
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Profile;
