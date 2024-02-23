// routes.js
import React from 'react';
import PermissionDecorator from './context/PermissionDecorator';

// Components
import AllUsers from './views/Users/AllUsers';
import AddUser from './views/Users/AddUser';
import ViewUser from './views/Users/ViewUser';
import UpdateUser from './views/Users/UpdateUser';
import Permission from './views/Users/UserPermissons';
import AllKeys from './views/KeyGenerator/AllKeys';
import NewKey from './views/KeyGenerator/NewKey';
import DownloadKeys from './views/KeyGenerator/DownloadKeys';
import AddGroup from './views/Group/AddGroup';
import AllGroups from './views/Group/AllGroups';
import AddPaper from './views/Group/Papers/AddPaper';
import Dashboard from './views/dashboard/Dashboard';

const routes = [
  { path: '/', exact: true, name: 'Home', element: <Dashboard /> },
  { path: '/dashboard', name: 'Dashboard', element: <Dashboard /> },
  { path: '*', name: 'Dashboard', element: <Dashboard /> },
  { path: '/users', name: 'All Users', element: <PermissionDecorator moduleId={1} permissionType="can_Delete" element={<AllUsers />} /> },
  { path: '/users/add-user', name: 'Add User', element: <PermissionDecorator moduleId={1} permissionType="can_Add" element={<AddUser />} /> },
  { path: '/users/view-user/:userId', name: 'View User', element: <PermissionDecorator moduleId={1} permissionType="can_View" element={<ViewUser />} /> },
  { path: '/users/update-user/:userId', name: 'Update User', element: <PermissionDecorator moduleId={1} permissionType="can_Update" element={<UpdateUser />} /> },
  { path: '/users/AddPermissions/:userId', name: 'User Permissions', element: <PermissionDecorator moduleId={1} permissionType="can_Add" element={<Permission />} /> },
  { path: '/KeyGenerator', name: 'Key Generator', element: <AllKeys /> },
  { path: '/KeyGenerator/Newkey', name: 'New Key', element: <NewKey /> },
  { path: '/KeyGenerator/download-keys', name: 'Download Keys', element: <DownloadKeys /> },
  { path: '/Groups/add-Group', name: 'Add Group', element: <AddGroup /> },
  { path: '/Groups', name: 'All Groups', element: <AllGroups /> },
  { path: '/Groups/AddPaper/:groupID/:sessionID', name: 'Add Paper', element: <AddPaper /> },
];

export default routes;
