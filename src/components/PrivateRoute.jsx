// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import { useUser } from '../context/UserContext';

const PrivateRoute = ({ element }) => {
  const { keygenUser } = useUser();

  // Check if the user is authenticated, otherwise redirect to the login page
  if (!keygenUser) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the provided element (which could be a Route or any other component)
  return element;
};

// Add prop type validation for the 'element' prop
PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default PrivateRoute;
