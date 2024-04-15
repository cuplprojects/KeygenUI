import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import ActivityData from './ActivityData';
import { useUser } from './../../context/UserContext';
const baseUrl = process.env.REACT_APP_BASE_URL;

const Activity = () => {
    const { keygenUser } = useUser();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${baseUrl}/api/Logs/Events/${keygenUser?.userID}`, {
            headers: {
                'Authorization': `Bearer ${keygenUser?.token}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch activities');
                }
                return response.json();
            })
            .then((data) => {
                setActivities(data); // Reverse the array
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(true);
                setLoading(false);
            });
    }, [keygenUser]);

    return (
        <Container>
            {loading ? (
                <Spinner />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <ActivityData activities={activities} />
            )}
        </Container>
    );
};

export default Activity;
