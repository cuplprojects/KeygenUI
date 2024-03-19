import React, { lazy } from 'react';
import AccessDeniedPage from './views/pages/page403/AccessDeniedPage';

const AllUsers = lazy(() => import('./views/Users/AllUsers'));
const Dashboard = lazy(() => import('./views/dashboard/Dashboard'));
const Profile = lazy(() => import('./views/Users/Profile'));
const AddUser = lazy(() => import('./views/Users/AddUser'));
const ViewUser = lazy(() => import('./views/Users/ViewUser'));
const UpdateUser = lazy(() => import('./views/Users/UpdateUser'));
const Permission = lazy(() => import('./views/Users/UserPermissons'));
const NewKey = lazy(() => import('./views/KeyGenerator/NewKey'));
const DownloadKeys = lazy(() => import('./views/KeyGenerator/DownloadKeys'));
const AllKeys = lazy(() => import('./views/KeyGenerator/AllKeys'));
// groups 
const AddGroup = lazy(() => import('./views/Group/AddGroup'));
const AllGroups = lazy(() => import('./views/Group/AllGroups'));
const ViewGroup = lazy(() => import('./views/Group/ViewGroup'));
// papers 
const PaperComponent = lazy(() => import('./views/Group/PaperComponent'));
const AddPaper = lazy(() => import('./views/Group/Papers/AddPaper'));
const ViewPaper = lazy(() => import('./views/Group/Papers/ViewPaper'));
// Master 
const JumblingConfig = lazy(() => import('./views/Master/JumblingConfig'));
const Sessions = lazy(() => import('./views/Master/Sessions'));
const Reactpdf = lazy(() => import('./views/pages/ReactPdf/Reactpdf'));

const routes = [
  { path: '/', name: 'Home', moduleId: null, permissionType: null, element: <Dashboard /> },
  { path: '*', name: 'Dashboard', moduleId: null, permissionType: null, element: <Dashboard /> },
  { path: '/dashboard', name: 'Dashboard', moduleId: null, permissionType: null, element: <Dashboard /> },
  { path: '/Profile', name: 'Profile', moduleId: null, permissionType: null, element: <Profile /> },

  { path: '/users', name: 'All Users', moduleId: null, permissionType: null, element: <AllUsers /> },
  { path: '/users/view-user/:userId', name: 'View User', moduleId: 1, permissionType: 'can_View', element: <ViewUser /> },
  { path: '/users/add-user', name: 'Add User', moduleId: 1, permissionType: 'can_Add', element: <AddUser /> },
  { path: '/users/update-user/:userId', name: 'Update User', moduleId: 1, permissionType: 'can_Update', element: <UpdateUser /> },

  { path: '/users/AddPermissions/:userId', name: 'Add Permissions', moduleId: 1, permissionType: 'can_Add', element: <Permission /> },
  
  { path: '/KeyGenerator', name: 'Key Generator', moduleId: null, permissionType: null, element: <AllKeys /> },
  { path: '/KeyGenerator/Newkey', name: 'New Key', moduleId: null, permissionType: null, element: <NewKey /> },
  { path: '/KeyGenerator/download-keys', name: 'Download Keys', moduleId: null, permissionType: null, element: <DownloadKeys /> },
  { path: '/Groups/add-Group', name: 'Add Group', moduleId: null, permissionType: null, element: <AddGroup /> },
  { path: '/Groups', name: 'All Groups', moduleId: null, permissionType: null, element: <AllGroups /> },
  { path: '/Groups/papers/:groupId', name: 'Papers', moduleId: null, permissionType: null, element: <PaperComponent /> },
  { path: '/Master/AddPaper', name: 'Add Paper', moduleId: null, permissionType: null, element: <AddPaper /> },
  { path: '/Groups/ViewPaper/:paperID', name: 'Add Paper', moduleId: null, permissionType: null, element: <ViewPaper /> },
  { path: '/403', name: 'Access Denied', moduleId: null, permissionType: null, element: <AccessDeniedPage /> },
  { path: '/Groups/ViewGroup/:groupID', name: 'View Group', moduleId: null, permissionType: null, element: <ViewGroup /> },
  { path: '/Master/JumblingConfig', name: ' JumblingConfig', moduleId: null, permissionType: null, element: <JumblingConfig /> },
  { path: '/Master/Sessions', name: ' Sessions', moduleId: null, permissionType: null, element: <Sessions /> },
  { path: '/reactpdf', name: ' reactpdf', moduleId: null, permissionType: null, element: <Reactpdf /> },
];

export default routes;
