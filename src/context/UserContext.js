// UserContext.jsx
import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useSecurity } from './Security';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { encrypt, decrypt } = useSecurity();

  const getKeygenUserFromLocalStorage = () => {
    const storedKeygenUser = localStorage.getItem('keygenUser');
    if (storedKeygenUser) {
      const { user_ID, ...rest } = JSON.parse(storedKeygenUser);
      const decryptedUserId = decrypt(user_ID); // Decrypt the user_ID
      return {
        ...rest,
        user_ID: decryptedUserId
      };
    }
    return null;
  };

  const [keygenUser, setKeygenUser] = useState(getKeygenUserFromLocalStorage());

  const login = (userData) => {
    // Encrypt the user_ID before storing it in localStorage
    const encryptedUserData = { ...userData, user_ID: encrypt(userData.user_ID) };
    localStorage.setItem('keygenUser', JSON.stringify(encryptedUserData));

    // Decrypt the user_ID before updating the keygenUser state
    const decryptedUserId = decrypt(encryptedUserData.user_ID);
    const decryptedUserData = { ...encryptedUserData, user_ID: decryptedUserId };
    setKeygenUser(decryptedUserData);
  };

  const logout = () => {
    setKeygenUser(null);
    localStorage.removeItem('keygenUser');
  };

  const isLoggedIn = () => {
    return !!keygenUser;
  };

  return (
    <UserContext.Provider value={{ keygenUser, login, logout, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
