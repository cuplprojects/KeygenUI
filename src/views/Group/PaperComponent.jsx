import React from 'react';
import PropTypes from 'prop-types';

const PaperComponent = ({ session }) => {
    return (
        <div className='border border-1 p-3'>
            <h3>Papers</h3>
            <p>Session Name: {session.session_Name}</p>
            <p>University ID: {session.university_id}</p>
        </div>
    );
};

PaperComponent.propTypes = {
    session: PropTypes.shape({
      session_Name: PropTypes.string.isRequired,
      university_id: PropTypes.string.isRequired
    }).isRequired
  };

export default PaperComponent;
