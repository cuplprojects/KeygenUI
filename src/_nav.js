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
    name: 'Master',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
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
        to: '/Master/Sessions',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
      
      {
        component: CNavItem,
        name: 'Jumble Configrations',
        to: '/Master/JumblingConfig',
        icon: <CIcon icon={cilHamburgerMenu} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Add Paper',
        to: '/Master/AddPaper',
        icon: <CIcon icon={cilNewspaper} customClassName="nav-icon" />,
      },
      
    ],
  },
]

export default _nav
