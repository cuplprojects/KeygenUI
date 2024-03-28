import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import PermissionChecker from './../context/PermissionChecker';
import { CBadge, CNavGroup, CNavItem } from '@coreui/react';

export const AppSidebarNav = ({ items }) => {
  const location = useLocation();

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon ? icon : (indent && <span className="nav-icon"><span className="nav-icon-bullet"></span></span>)}
        {name && name}
        {badge && <CBadge color={badge.color} className="ms-auto">{badge.text}</CBadge>}
      </>
    );
  };

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, ...rest } = item;
    const Component = component;

    return (
      <Component
        {...(rest.to && !rest.items && { component: NavLink })}
        key={index}
        {...rest}
      >
        {navLink(name, icon, badge, indent)}
      </Component>
    );
  };

  const navGroup = (item, index) => {
    const { component, name, icon, items, module, permissiontype, to, ...rest } = item;
    const Component = component;
    return (
      <PermissionChecker key={index}>
        {({ hasPermission }) => (
          hasPermission(module, permissiontype) && (
            <Component
              compact
              idx={String(index)}
              key={index}
              toggler={navLink(name, icon)}
              visible={location.pathname.startsWith(to)}
              {...rest}
            >
              {items?.map((subItem, subIndex) =>
                subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true)
              )}
            </Component>
          )
        )}
      </PermissionChecker>
    );
  };

  return (
    <React.Fragment>
      {items && items.map((item, index) => (
        item.items ? navGroup(item, index) : navItem(item, index)
      ))}
    </React.Fragment>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default AppSidebarNav;
