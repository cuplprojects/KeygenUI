// Activity.jsx
import React, { useState, useEffect } from 'react';
import { Container, Alert } from 'react-bootstrap';
import ActivityData from './ActivityData';
import { useUser } from '../../context/UserContext';
import SkeletonLoader from './SkeletonLoader'; // Import the SkeletonLoader component
import PropTypes from 'prop-types';
const baseUrl = process.env.REACT_APP_BASE_URL;

const ActivityTable = ({ datacount = 10, userId }) => {
    const { keygenUser } = useUser();
    const user = userId || keygenUser?.userID
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        fetch(`${baseUrl}/api/Logs/Events/User/${user}/count/${datacount}`, {
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
                <Alert variant="danger">No Activity Found!</Alert>
            ) : (
                <ActivityData activities={activities}/>
            )}
        </Container>
    );
};
ActivityTable.propTypes = {
    datacount: PropTypes.number,
    userId: PropTypes.number,
};


export default ActivityTable;
