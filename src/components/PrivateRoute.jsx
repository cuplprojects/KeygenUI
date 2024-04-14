// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import { useUser } from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ element }) => {
  const { keygenUser, logout } = useUser();

  // Check if the user is authenticated 
  if (!keygenUser) {
    return <Navigate to="/login" />;
  }

  // Check if the JWT token has expired
  const token = keygenUser.token;
  if (token) {

    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        // Token has expired, log the user out
        logout();
        return <Navigate to="/login" />;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // If authenticated and token not expired, render the provided element
  return element;
};

// Add prop type validation for the 'element' prop
PrivateRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default PrivateRoute;
