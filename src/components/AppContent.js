import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PermissionDecorator from './../context/PermissionDecorator';
import { Container, Spinner } from 'react-bootstrap';
import routes from './../routes';

const AppContent = () => {
  return (
    <Container fluid className="px-4" >
      <Suspense fallback={<div className="h-100 w-100 d-flex align-items-center justify-content-center">
        <Spinner color="primary" variant="grow" />
      </div>}>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} name={route.name} element={route.moduleId ? <PermissionDecorator moduleId={route.moduleId} permissionType={route.permissionType} element={route.element} /> : route.element} />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </Container>
  );
};

export default React.memo(AppContent);
