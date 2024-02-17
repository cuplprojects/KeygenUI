import React from 'react';

const PaperComponent = ({ session }) => {
    return (
        <div className='border border-1 p-3'>
            <h3>Papers</h3>
            <p>Session Name: {session.session_Name}</p>
            <p>University ID: {session.university_id}</p>
        </div>
    );
};

export default PaperComponent;
