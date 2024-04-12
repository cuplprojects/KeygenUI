// UserContext.jsx
import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useSecurity } from './Security';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { encrypt, decrypt } = useSecurity();

  const getKeygenUserFromSessionStorage = () => {
    const storedKeygenUser = sessionStorage.getItem('keygenUser');
    if (storedKeygenUser) {
      const { userID, ...rest } = JSON.parse(storedKeygenUser);
      if (typeof userID === 'number') {
        sessionStorage.removeItem('keygenUser');
      }
      const decryptedUserId = decrypt(userID); // Decrypt the userID
      return {
        ...rest,
        userID: decryptedUserId
      };
    }
    return null;
  };


  const [keygenUser, setKeygenUser] = useState(getKeygenUserFromSessionStorage());

  const login = (userData) => {
    // Encrypt the userID before storing it in sessionStorage
    const encryptedUserData = { ...userData, userID: encrypt(userData.userID) };
    sessionStorage.setItem('keygenUser', JSON.stringify(encryptedUserData));

    // Decrypt the userID before updating the keygenUser state
    const decryptedUserId = decrypt(encryptedUserData.userID);
    const decryptedUserData = { ...encryptedUserData, userID: decryptedUserId };
    setKeygenUser(decryptedUserData);
  };

  const logout = () => {
    setKeygenUser(null);
    sessionStorage.removeItem('keygenUser');
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
