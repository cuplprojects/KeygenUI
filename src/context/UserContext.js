import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { useSecurity } from './Security';

// Helper function to retrieve keygenUser from local storage
const getKeygenUserFromLocalStorage = () => {
  const storedKeygenUser = localStorage.getItem('keygenUser');
  return storedKeygenUser ? JSON.parse(storedKeygenUser) : null;
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize keygenUser state using the helper function
  const [keygenUser, setKeygenUser] = useState(getKeygenUserFromLocalStorage());

  // Function to log in a user and update keygenUser state
  const login = (userData) => {
    setKeygenUser(userData);
    localStorage.setItem('keygenUser', JSON.stringify(userData));
  };

  // Function to log out a user and clear keygenUser state
  const logout = () => {
    setKeygenUser(null);
    localStorage.removeItem('keygenUser');
  };

  // Function to check if a user is logged in
  const isLoggedIn = () => {
    return !!keygenUser; // Return true if keygenUser is not null or undefined
  };

  // Provide keygenUser, login, logout, and isLoggedIn functions to the context
  return (
    <UserContext.Provider value={{ keygenUser, login, logout, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

// Add prop type validation for the 'children' prop
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => {
  // Use the context to access keygenUser, login, logout, and isLoggedIn functions
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
