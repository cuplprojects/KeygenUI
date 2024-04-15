import React, { useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import $ from 'jquery';
import PropTypes from 'prop-types';

const ActivityData = ({ activities }) => {
    const tableRef = useRef(null);

    useEffect(() => {
        $(tableRef.current).DataTable({
            order: [[2, 'desc']]
        });
    }, []);

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <Table striped bordered hover ref={tableRef}>
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Logged At</th>
                </tr>
            </thead>
            <tbody>
                {activities.slice().reverse().map((activity) => (
                    <tr key={activity.eventID}>
                        <td>{activity.event}</td>
                        <td>{activity.category}</td>
                        <td>{formatDateTime(activity.loggedAT)}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

ActivityData.propTypes = {
    activities: PropTypes.array.isRequired,
};

export default ActivityData;
