// SecurityContext.jsx
import { createContext, useContext } from 'react';
import CryptoJS from 'crypto-js';
const SecretKey = process.env.REACT_APP_SECRET_KEY;


// Encryption and decryption functions using AES
const encrypt = (data) => {
  const encryptedData = CryptoJS.AES.encrypt(data.toString(), SecretKey).toString();
  return encryptedData.replace(/\//g, ';');
};

const decrypt = (encryptedData) => {
  encryptedData = encryptedData.replace(/;/g, '/');
  const decryptedData = CryptoJS.AES.decrypt(encryptedData, SecretKey).toString(CryptoJS.enc.Utf8);
  return decryptedData;
};

// Create the SecurityContext
const SecurityContext = createContext({ encrypt, decrypt });

// Custom hook to use the SecurityContext
export const useSecurity = () => useContext(SecurityContext);

export default SecurityContext;
