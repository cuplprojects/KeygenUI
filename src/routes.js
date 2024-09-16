import React, { lazy } from 'react';
import AccessDeniedPage from './views/pages/page403/AccessDeniedPage';
import CTypeComponent from './views/Masters/CTypeComponent/CTypeComponent';

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
// const AddGroup = lazy(() => import('./views/Group/AddGroup'));
// const AllGroups = lazy(() => import('./views/Group/AllGroups'));
const AllGroups = lazy(() => import('./views/Masters/Groups/Groups'));
// const ViewGroup = lazy(() => import('./views/Group/ViewGroup'));
// papers 
// const PaperComponent = lazy(() => import('./views/Group/PaperComponent'));
const AddPaper = lazy(() => import('./views/Masters/Papers/AddPaper'));
const ViewPaper = lazy(() => import('./views/Masters/Papers/ViewPaper'));
// Masters
const JumblingConfig = lazy(() => import('./views/Masters/JumblingConfig/JumblingConfig'));
const Sessions = lazy(() => import('./views/Masters/Sessions/Sessions'));
const Courses = lazy(() => import('./views/Masters/Courses/Courses'));
const Subjects = lazy(() => import('./views/Masters/Subjects/Subjects'));
const Papers = lazy(() => import('./views/Masters/Papers/Papers'));
const Programs = lazy(() => import('./views/Masters/Programs/Programs'));
const ManageKeys = lazy(() => import('./views/Masters/ManageKeys/ManageKeys'));

// Pdf upload 
const BulkPdfUpload = lazy(() => import('./views/Verification/BulkPdfUpload'));
const VerificationStatus = lazy(() => import('./views/Verification/VerificationStatus'));
const VerificationWindow = lazy(() => import('./views/Verification/VerificationWindow'));

const routes = [
  { path: '/', name: 'Home', moduleId: null, permissionType: null, element: <Dashboard /> },
  { path: '*', name: 'Dashboard', moduleId: null, permissionType: null, element: <Dashboard /> },
  { path: '/dashboard', name: 'Dashboard', moduleId: null, permissionType: null, element: <Dashboard /> },
  { path: '/Profile', name: 'Profile', moduleId: null, permissionType: null, element: <Profile /> },

  { path: '/users', name: 'All Users', moduleId: 1, permissionType: 'can_View', element: <AllUsers /> },
  { path: '/users/view-user/:userId', name: 'View User', moduleId: 1, permissionType: 'can_View', element: <ViewUser /> },
  { path: '/users/add-user', name: 'Add User', moduleId: 1, permissionType: 'can_Add', element: <AddUser /> },
  { path: '/users/update-user/:userId', name: 'Update User', moduleId: 1, permissionType: 'can_Update', element: <UpdateUser /> },

  { path: '/users/AddPermissions/:userId', name: 'Add Permissions', moduleId: 1, permissionType: 'can_Add', element: <Permission /> },
  
  { path: '/KeyGenerator', name: 'Generated Keys', moduleId: 2, permissionType: 'can_View', element: <AllKeys /> },
  { path: '/KeyGenerator/Newkey', name: 'New Key', moduleId: 2, permissionType: 'can_Add', element: <NewKey /> },
  { path: '/KeyGenerator/Newkey/download-keys', name: 'Download Keys', moduleId: 2, permissionType: 'can_View', element: <DownloadKeys /> },

  { path: '/Groups', name: 'All Groups', moduleId: 3, permissionType: 'can_View', element: <AllGroups /> },
  // { path: '/Groups/add-Group', name: 'Add Group', moduleId: 3, permissionType: 'can_Add', element: <AddGroup /> },
  // { path: '/Groups/ViewGroup/:groupID', name: 'View Group', moduleId: 3, permissionType: 'can_View', element: <ViewGroup /> },

  // { path: '/Groups/papers/:groupId', name: 'Papers', moduleId: null, permissionType: null, element: <PaperComponent /> },
  
  { path: '/Masters/papers', name: 'All Papers', moduleId: 3, permissionType: 'can_View', element: <Papers /> },
  { path: '/Masters/papers/AddPaper', name: 'Add Paper', moduleId: 3, permissionType: 'can_Add', element: <AddPaper /> },
  { path: '/Masters/JumblingConfig', name: ' JumblingConfig', moduleId: 3, permissionType: 'can_Add', element: <JumblingConfig /> },
  { path: '/Masters/Sessions', name: ' Sessions', moduleId: 3, permissionType: 'can_Add', element: <Sessions /> },
  { path: '/Masters/Courses', name: ' Courses', moduleId: 3, permissionType: 'can_Add', element: <Courses /> },
  { path: '/Masters/Subjects', name: ' Subjects', moduleId: 3, permissionType: 'can_Add', element: <Subjects /> },
  { path: '/Masters/Programs', name: ' Programs', moduleId: 3, permissionType: 'can_Add', element: <Programs /> },
  { path: '/Masters/ExamType', name: ' ExamType', moduleId: 3, permissionType: 'can_Add', element: <CTypeComponent /> },
  { path: '/Masters/ManageKeys', name: ' Manage Keys', moduleId: 3, permissionType: 'can_View', element: <ManageKeys /> },
  
    // pdf upload 
    { path: '/verification/upload', name: 'Upload PDF', moduleId: null, permissionType: null, element: <BulkPdfUpload /> },
    { path: '/verification/verificationstatus', name: 'Upload PDF', moduleId: null, permissionType: null, element: <VerificationStatus /> },
    { path: '/verification/verificaton', name: 'Upload PDF', NoBreadcrumb:true, moduleId: null, permissionType: null, element: <VerificationWindow /> },
  
  { path: '/Masters/papers/ViewPaper/:paperID', name: 'View Paper', moduleId: 3, permissionType: 'can_View', element: <ViewPaper /> },

  { path: '/403', name: 'Access Denied', moduleId: null, permissionType: null, element: <AccessDeniedPage /> },
];

export default routes;