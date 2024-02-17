import CryptoJS from 'crypto-js';

const SECURITY_KEY = process.env.REACT_APP_SECURITY_KEY || 'default_key';

const Security = {
  encrypt: (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECURITY_KEY).toString();
  },

  decrypt: (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, SECURITY_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  },
};

export default Security;
