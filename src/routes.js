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
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  // MyRouts
  // user Routes
  { path: '/users', name: 'All Users', element: AllUsers },
  { path: '/users/add-user', name: 'Add User', element: AddUser },
  { path: '/users/view-user/:userId', name: 'view User', element: ViewUser },
  { path: '/users/update-user/:userId', name: 'Update User', element: UpdateUser },
  //Permission Page Route
  { path: '/users/AddPermissions/:userId', Name: 'User Permissions', element: Permission},
  // KeyGenerator,,
  { path: '/KeyGenerator', name: 'Key Generator', element: AllKeys },
  { path: '/KeyGenerator/Newkey', name: 'New Key', element: NewKey },
  { path: '/KeyGenerator/download-keys', name: 'Download Keys', element: DownloadKeys },
// Group
  { path: '/Groups/add-Group', name: 'Add Group', element: AddGroup },
  { path: '/Groups', name: 'All Groups', element: AllGroups },
  // Paper
  { path: '/Groups/AddPaper', name: 'Add Paper', element: AddPaper }


]

export default routes
