// PermissionDecorator.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // Import PropTypes
import { useUser } from './UserContext';
import axios from 'axios';
const BaseUrl = process.env.REACT_APP_BASE_URL;

const PermissionDecorator = ({ element, moduleId, permissionType }) => {
  const { keygenUser } = useUser();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userId = keygenUser.userID; // Assuming you are using a fixed userId for now
        const response = await axios.get(`${BaseUrl}/api/Permissions/ByUser/${userId}`,{
          headers:{
            Authorization: `Bearer ${keygenUser?.token}`
          }
        });
        setPermissions(response.data);
        setLoading(false);
   
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [keygenUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const canAccess = (moduleId, permissionType) => {
    const permission = permissions.find(p => p.moduleID === moduleId);
    return permission && permission[permissionType];
  };

  // Check if the user has permission to access the module, otherwise redirect
  if (!canAccess(moduleId, permissionType)) {
    return <Navigate to="/403" />;
  }

  // If authenticated and has permission, render the provided element
  return element;
};

// Add prop type validation for the 'element' prop
PermissionDecorator.propTypes = {
  element: PropTypes.element.isRequired,
  moduleId: PropTypes.number.isRequired,
  permissionType: PropTypes.string.isRequired,
};

export default PermissionDecorator;
