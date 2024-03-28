import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilGroup,
  cilPlus,
  cilHamburgerMenu,
  cilNewspaper,
  cilApplications,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Management',
  },
  {
    component: CNavGroup,
    name: 'Users',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    module: 1,
    permission: 'can_View',
    items: [
      {
        component: CNavItem,
        name: 'Add User',
        to: '/users/add-user',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'All Users',
        to: '/users',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
    ],
  },
  
  {
    component: CNavGroup,
    name: 'Key Generator',
    icon: <CIcon icon={cilNewspaper} customClassName="nav-icon" />,
    module: 2,
    permission: 'can_View',
    items: [
      {
        component: CNavItem,
        name: 'Generate New',
        to: '/KeyGenerator/Newkey',
        icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'All Generated Keys',
        to: '/KeyGenerator',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Masters',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
    module: 3,
    permission: 'can_View',
    items: [
      {
        component: CNavGroup,
        name: 'Groups',
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            name: 'Add Group',
            to: '/Groups/add-Group',
            icon: <CIcon icon={cilPlus} customClassName="nav-icon" />,
          },
          {
            component: CNavItem,
            name: 'All Groups',
            to: '/Groups',
            icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
          },
        ],
      },
      {
        component: CNavItem,
        name: 'Sessions',
        to: '/Masters/Sessions',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
      
      {
        component: CNavItem,
        name: 'Jumble Configrations',
        to: '/Masters/JumblingConfig',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Papers',
        to: '/Masters/papers',
        icon: <CIcon icon={cilNewspaper} customClassName="nav-icon" />,
      },
      
    ],
  },
]

export default _nav
