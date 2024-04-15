// AppHeader.jsx
import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../context/UserContext';

import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilContrast,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons';
import { Button} from 'react-bootstrap';

import { AppBreadcrumb } from './index';
import { AppHeaderDropdown } from './header/index';
import axios from 'axios';
const baseUrl = process.env.REACT_APP_BASE_URL;

const AppHeader = () => {
  const headerRef = useRef();
  const [isfullscreen, setIsfullscreen] = useState(false);
  const { colorMode, setColorMode } = useColorModes('CUPL_KeyGen_Theme');

  const dispatch = useDispatch();
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const { keygenUser, logout, expandSession } = useUser(); // Assuming you have a useUser hook to access the user context

  // State to store the remaining time until session expiration
  const [sessionExpirationCountdown, setSessionExpirationCountdown] = useState(0);

  useEffect(() => {
    if (keygenUser && keygenUser.token) {
      const decodedToken = jwtDecode(keygenUser.token);
      const currentTime = Math.floor(Date.now() / 1000);
      const expiresIn = decodedToken.exp - currentTime;
      setSessionExpirationCountdown(expiresIn);


      // Update the countdown every second
      const interval = setInterval(() => {
        setSessionExpirationCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            // Logout if countdown reaches 0
            clearInterval(interval);
            logout(); // Assuming logout is a function from your user context
            return 0;
          }
        });
      }, 1000);

      // Clear the interval when the component is unmounted
      return () => clearInterval(interval);
    }
  }, [keygenUser, logout]);

  const toggleFullScreen = () => {
    const docElm = document.documentElement
    const fullScreenEnabled =
      document.fullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.documentElement.webkitRequestFullScreen

    if (fullScreenEnabled) {
      setIsfullscreen(true)
      if (
        !document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen()
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen()
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen()
        }
      } else {
        setIsfullscreen(false)
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        }
      }
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
        <CContainer className="border-bottom px-4" fluid>
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            style={{ marginInlineStart: '-14px' }}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CHeaderToggler>
          <CHeaderNav className="d-none d-md-flex align-items-center">
            <CNavItem>
              <CNavLink to="/dashboard" component={NavLink}>
                Dashboard
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink className='hovericon' onClick={toggleFullScreen}>
                {isfullscreen ? (
                  <i className="fa-solid fa-minimize font-weight-light"></i>
                ) : (
                  <i className="fa-solid fa-maximize font-weight-light"></i>
                )}
              </CNavLink>

            </CNavItem>
            <CNavItem>
              <CNavLink className='hovericon' >
                {sessionExpirationCountdown > 0 && sessionExpirationCountdown <= 60 && (
                  <div className='ms-5  text-danger'>
                    Your session will expire in {formatTime(sessionExpirationCountdown)} Hour.
                    {/* <Button className='btn-sm mx-3' onClick={expandSession}>Expand Session</Button> */}
                  </div>
                )}
              </CNavLink>

            </CNavItem>

          </CHeaderNav>
          <CHeaderNav className="ms-auto">
            {/* <CNavItem>
              <CNavLink >
                <CIcon icon={cilSettings} size="lg" />
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink>
                <CIcon icon={cilEnvelopeOpen} size="lg" />
              </CNavLink>
            </CNavItem> */}
          </CHeaderNav>
          <CHeaderNav>
            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false}>
                {colorMode === 'dark' ? (
                  <CIcon icon={cilMoon} size="lg" />
                ) : colorMode === 'auto' ? (
                  <CIcon icon={cilContrast} size="lg" />
                ) : (
                  <CIcon icon={cilSun} size="lg" />
                )}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem
                  active={colorMode === 'light'}
                  className="d-flex align-items-center"
                  component="button"
                  type="button"
                  onClick={() => setColorMode('light')}
                >
                  <CIcon className="me-2" icon={cilSun} size="lg" /> Light
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'dark'}
                  className="d-flex align-items-center"
                  component="button"
                  type="button"
                  onClick={() => setColorMode('dark')}
                >
                  <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'auto'}
                  className="d-flex align-items-center"
                  component="button"
                  type="button"
                  onClick={() => setColorMode('auto')}
                >
                  <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <AppHeaderDropdown />
          </CHeaderNav>
        </CContainer>
        <CContainer className="px-4" fluid>
          <AppBreadcrumb />
        </CContainer>
      </CHeader>
    </>
  );
};

export default AppHeader;
