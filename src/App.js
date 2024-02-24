// src/App.js
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import { UserProvider } from './context/UserContext';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute component
import './scss/style.scss';
import AccessDeniedPage from './views/pages/page403/AccessDeniedPage';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const ForgotPassword = React.lazy(() => import('./views/pages/ForgotPassword/ForgotPassword'));
const ChangePassword = React.lazy(() => import('./views/pages/ChangePassword/ChangePassword'));
// const ImageUpload = React.lazy(() => import('./components/ImageUpload'));

const App = () => {
  // Use the 'useColorModes' hook to manage color modes
  const { isColorModeSet, setColorMode } = useColorModes('CUPL_KeyGen_Theme');

  // Retrieve the stored theme from the Redux store
  const storedTheme = useSelector((state) => state.theme);

  // useEffect to handle theme changes and initial setup
  useEffect(() => {
    // Get theme from URL parameters
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];

    // Set theme if it exists in the URL
    if (theme) {
      setColorMode(theme);
    }

    // If color mode is already set, return
    if (isColorModeSet()) {
      return;
    }

    // Set theme from the stored theme in Redux store
    setColorMode(storedTheme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    // Wrap the app with 'UserProvider' for seamless user context in authentication and state.
    <UserProvider>
      {/* BrowserRouter to manage navigation */}
      <BrowserRouter>
        {/* Suspense for lazy loading and loading fallback */}
        <Suspense
          fallback={
            <div className="vh-100 vw-100 d-flex align-items-center justify-content-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          {/* Define the routes using 'Routes' component */}
          <Routes>
            <Route exact path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            
            <Route path="/403" element={<PrivateRoute element={<AccessDeniedPage />} />} />

            {/* Private route for authenticated users */}
            <Route path="/ChangePassword" element={<PrivateRoute element={<ChangePassword />} />} />
            <Route path="*" element={<PrivateRoute element={<DefaultLayout />} />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
