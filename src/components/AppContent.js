import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CContainer } from '@coreui/react';
import PermissionDecorator from './../context/PermissionDecorator';
import AccessDeniedPage from './../views/pages/page403/AccessDeniedPage';
import { Spinner } from 'react-bootstrap';

const AllUsers = lazy(() => import('./../views/Users/AllUsers'));
const Dashboard = lazy(() => import('./../views/dashboard/Dashboard'));
const AddUser = lazy(() => import('./../views/Users/AddUser'));
const ViewUser = lazy(() => import('./../views/Users/ViewUser'));
const UpdateUser = lazy(() => import('./../views/Users/UpdateUser'));
const Permission = lazy(() => import('./../views/Users/UserPermissons'));
const NewKey = lazy(() => import('./../views/KeyGenerator/NewKey'));
const DownloadKeys = lazy(() => import('./../views/KeyGenerator/DownloadKeys'));
const AllKeys = lazy(() => import('./../views/KeyGenerator/AllKeys'));
const AddGroup = lazy(() => import('./../views/Group/AddGroup'));
const AllGroups = lazy(() => import('./../views/Group/AllGroups'));
const AddPaper = lazy(() => import('./../views/Group/Papers/AddPaper'));
const ViewPaper = lazy(() => import('./../views/Group/Papers/ViewPaper'));
const PaperConfig  = lazy(() => import('./../views/Group/Papers/PaperConfig'));

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<div className="h-100 w-100 d-flex align-items-center justify-content-center">
        <Spinner color="primary" variant="grow" />
      </div>}>
        <Routes>
          <Route path="/" name="Home" element={<Dashboard />} />
          <Route path="/dashboard" name="Dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
          <Route path="/users" name="All Users" element={<PermissionDecorator moduleId={1} permissionType="can_View" element={<AllUsers />} />} />
          <Route path="/users/add-user" name="Add User" element={<PermissionDecorator moduleId={1} permissionType="can_Add" element={<AddUser />} />} />
          <Route path="/users/view-user/:userId" name="View User" element={<PermissionDecorator moduleId={1} permissionType="can_View" element={<ViewUser />} />} />
          <Route path="/users/update-user/:userId" name="Update User" element={<PermissionDecorator moduleId={1} permissionType="can_Update" element={<UpdateUser />} />} />
          <Route path="/users/AddPermissions/:userId" name="Add Permissions" element={<PermissionDecorator moduleId={1} permissionType="can_Add" element={<Permission />} />} />

          <Route path="/KeyGenerator" name="Key Generator" element={<AllKeys />} />
          <Route path="/KeyGenerator/Newkey" name="New Key" element={<NewKey />} />
          <Route path="/KeyGenerator/download-keys" name="Download Keys" element={<DownloadKeys />} />
          <Route path="/Groups/add-Group" name="Add Group" element={<AddGroup />} />
          <Route path="/Groups" name="All Groups" element={<AllGroups />} />
          <Route path="/Groups/AddPaper/:groupID/:sessionID" name="Add Paper" element={<AddPaper />} />
          <Route path="/Groups/ViewPaper/:paperID" name="Add Paper" element={<ViewPaper />} />
          <Route path="/403" name="Access Denied" element={<AccessDeniedPage />} />
          <Route path="/Groups/PaperConfig/:groupID/:sessionID/:paperID"  name="Paper Configration" element={<PaperConfig />} />
        </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);
