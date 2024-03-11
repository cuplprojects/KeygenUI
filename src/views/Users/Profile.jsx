// Profile.js
import React, { useState, useEffect } from 'react';
import { useUser } from './../../context/UserContext';
import { fetchUserData, updateProfilePicture } from './../../context/UserData';
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';
import { Accordion, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const BaseUrl = process.env.REACT_APP_BASE_URL;

const Profile = () => {
    const { keygenUser } = useUser();
    const [userData, setUserData] = useState(null);
    const [profilePicturePath, setProfilePicturePath] = useState(DefaultAvatar);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (keygenUser) {
                    setLoading(true);
                    const userData = await fetchUserData(keygenUser.user_ID);
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

    const handleUpload = async () => {
        if (selectedImage && keygenUser) {
            setLoading(true);
            try {
                await updateProfilePicture(keygenUser.user_ID, selectedImage);
                const updatedUserData = await fetchUserData(keygenUser.user_ID);
                setUserData(updatedUserData);
                setProfilePicturePath(`${BaseUrl}/${updatedUserData.profilePicturePath}?${new Date().getTime()}`);
            } catch (error) {
                console.error('Error updating profile picture:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Container>
            {loading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : userData && (
                <Row>
                    <Col md={5} className="text-center">
                        <Card className="mx-auto w-100">
                            <Card.Img variant="top" src={profilePicturePath} className="rounded" alt="Profile" />
                            <Card.Body>
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
                                <input type="file" onChange={handleImageChange} />
                                <button onClick={handleUpload}>Update Profile Picture</button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={7}>
                        <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                <FontAwesomeIcon icon={faKey} className='me-3'/> ********</Accordion.Header>
                                <Accordion.Body className='rounded'>
                                 <Link to={'/ChangePassword'}> Change Password</Link>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1" className='mt-3 rounded'>
                                <Accordion.Header>Activity</Accordion.Header>
                                <Accordion.Body>
                                    No Activity Found.
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
