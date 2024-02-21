import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// User
const AddUser = React.lazy(() => import('./views/Users/AddUser'))
const AllUsers = React.lazy(() => import('./views/Users/AllUsers'))
const ViewUser = React.lazy(() => import('./views/Users/ViewUser'))
const UpdateUser = React.lazy(() => import('./views/Users/UpdateUser'))
//Permissions
const Permission = React.lazy(()=>import('./views/Users/UserPermissons'))

// Keygenerator
const NewKey = React.lazy(()=>import('./views/KeyGenerator/NewKey'))
const DownloadKeys = React.lazy(()=>import('./views/KeyGenerator/DownloadKeys'))
const AllKeys = React.lazy(()=>import('./views/KeyGenerator/AllKeys'))

// Group
const AddGroup = React.lazy(()=>import('./views/Group/AddGroup'))
const AllGroups = React.lazy(()=>import('./views/Group/AllGroups'))

// Paper
const AddPaper = React.lazy(()=>import('./views/Group/Papers/AddPaper'))




const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard, permissionType: 'dashboard.view' },

  // User Routes
  { path: '/users', name: 'All Users', element: AllUsers, permissionType: 'users.view' },
  { path: '/users/add-user', name: 'Add User', element: AddUser, permissionType: 'users.add' },
  { path: '/users/view-user/:userId', name: 'view User', element: ViewUser, permissionType: 'users.view' },
  { path: '/users/update-user/:userId', name: 'Update User', element: UpdateUser, permissionType: 'users.update' },

  // KeyGenerator Routes
  { path: '/KeyGenerator', name: 'Key Generator', element: AllKeys, permissionType: 'keygenerator.view' },
  { path: '/KeyGenerator/Newkey', name: 'New Key', element: NewKey, permissionType: 'keygenerator.add' },
  { path: '/KeyGenerator/download-keys', name: 'Download Keys', element: DownloadKeys, permissionType: 'keygenerator.download' },

  // Group Routes
  { path: '/Groups/add-Group', name: 'Add Group', element: AddGroup, permissionType: 'groups.add' },
  { path: '/Groups', name: 'All Groups', element: AllGroups, permissionType: 'groups.view' },

  // Paper Routes
  { path: '/Groups/AddPaper/:groupID/:sessionID', name: 'Add Paper', element: AddPaper, permissionType: 'paper.add' }
];


export default routes
