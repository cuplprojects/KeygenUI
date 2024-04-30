// Activity.jsx
import React, { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import ActivityData from './ActivityData';
import { useUser } from '../../context/UserContext';
import SkeletonLoader from './SkeletonLoader'; // Import the SkeletonLoader component
const baseUrl = process.env.REACT_APP_BASE_URL;

const ActivityTable = () => {
    const { keygenUser } = useUser();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [datacount, setDataCount] = useState(5)
    

    useEffect(() => {
        fetch(`${baseUrl}/api/Logs/Events/User/${keygenUser?.userID}/count/${datacount}`, {
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
                <SkeletonLoader /> // Render the SkeletonLoader component while loading
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <ActivityData activities={activities} setDataCount={setDataCount} />
            )}
        </Container>
    );
};

export default ActivityTable;
