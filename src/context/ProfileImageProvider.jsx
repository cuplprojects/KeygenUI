import React, { createContext, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const ProfileImageContext = createContext();

export const ProfileImageProvider = ({ children }) => {
  const [profileImageUrlCache, setProfileImageUrlCache] = useState({});

  const updateProfileImageUrl = (userId, newImageUrl) => {
    setProfileImageUrlCache({ ...profileImageUrlCache, [userId]: newImageUrl });
  };

  const getProfileImageUrl = (userId) => {
    return profileImageUrlCache[userId] || '';
  };

  const value = useMemo(() => ({ updateProfileImageUrl, getProfileImageUrl }), [profileImageUrlCache]);

  return (
    <ProfileImageContext.Provider value={value}>
      {children}
    </ProfileImageContext.Provider>
  );
};

ProfileImageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProfileImage = () => {
  const context = useContext(ProfileImageContext);
  if (!context) {
    throw new Error('useProfileImage must be used within a ProfileImageContextProvider');
  }
  return context;
};
