import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useSecurity } from './Security';
import axios from 'axios';
const baseUrl = process.env.REACT_APP_BASE_URL;

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

  const expandSession = () => {
    axios.post(`${baseUrl}/api/Login/Extend`, null, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keygenUser?.token}`
        }
    })
    .then((response) => {
        // Encrypt the userID before storing it in sessionStorage
        const encryptedUserData = { ...response.data, userID: encrypt(response.data.userID) };
        sessionStorage.setItem('keygenUser', JSON.stringify(encryptedUserData));
        // Update state with new data
        setKeygenUser(encryptedUserData);
    })
    .catch((error) => {
        console.error('Error expanding session:', error);
    });
  };

  return (
    <UserContext.Provider value={{ keygenUser, login, logout, isLoggedIn, expandSession }}>
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
