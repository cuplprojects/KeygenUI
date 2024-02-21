import React from 'react';
import PermissionChecker from './../context/PermissionChecker'; // Assuming this is the path to your PermissionChecker component

const MyComponent = () => {
  return (
    <PermissionChecker  moduleId={1}>
      {userPermissions => (
        <div>
          {userPermissions.can_View && <p>Can view content</p>}
          {userPermissions.can_Add && <p>Can add content</p>}
          {userPermissions.can_Update && <p>Can update content</p>}
          {userPermissions.can_Delete && <p>Can delete content</p>}
        </div>
      )}
    </PermissionChecker>
  );
};

export default MyComponent;
