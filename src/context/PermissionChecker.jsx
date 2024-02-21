import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext'; // Assuming this is the path to your UserContext component

const PermissionChecker = ({ permissionType, children }) => {
  const { keygenUser } = useUser();
  const userId = keygenUser.user_ID; // Assuming your user object has a userId property
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(`https://localhost:7247/api/Permissions/ByUser/${userId}`);
        setPermissions(response.data);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    };

    fetchPermissions();
  }, [userId]);

  const hasPermission = permissions.some(permission => permission.permissionType === permissionType);

  return hasPermission ? children : null;
};

export default PermissionChecker;
