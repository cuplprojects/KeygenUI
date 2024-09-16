import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../routes';
import { CBreadcrumb, CBreadcrumbItem, CContainer } from '@coreui/react';

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname;

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => {
      const routePathSegments = route.path.split('/');
      const pathnameSegments = pathname.split('/');

      if (routePathSegments.length !== pathnameSegments.length) {
        return false;
      }

      return routePathSegments.every((segment, index) => {
        return segment === pathnameSegments[index] || segment.startsWith(':');
      });
    });

    return currentRoute ? currentRoute.name : false;
  };

  const getNoBreadcrumb = (pathname, routes) => {
    const currentRoute = routes.find((route) => {
      const routePathSegments = route.path.split('/');
      const pathnameSegments = pathname.split('/');

      if (routePathSegments.length !== pathnameSegments.length) {
        return false;
      }

      return routePathSegments.every((segment, index) => {
        return segment === pathnameSegments[index] || segment.startsWith(':');
      });
    });

    return currentRoute ? currentRoute.NoBreadcrumb : false;
  };

  const getBreadcrumbs = (location) => {
    const breadcrumbs = [];
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`;
      const routeName = getRouteName(currentPathname, routes);
      const noBreadcrumb = getNoBreadcrumb(currentPathname, routes);

      if (!noBreadcrumb && routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length ? true : false,
        });
      }
      return currentPathname;
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(currentLocation);

  // If there's no breadcrumb to display, return null (no breadcrumb UI will be rendered)
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <CContainer className="px-4" fluid>
      <CBreadcrumb className="my-0">
        <CBreadcrumbItem>
          <Link to="/">Home</Link>
        </CBreadcrumbItem>
        {breadcrumbs.map((breadcrumb, index) => {
          return (
            <CBreadcrumbItem
              {...(breadcrumb.active ? { active: true } : { href: `#${breadcrumb.pathname}` })}
              key={index}
            >
              {breadcrumb.name}
            </CBreadcrumbItem>
          );
        })}
      </CBreadcrumb>
    </CContainer>
  );
};

export default React.memo(AppBreadcrumb);
