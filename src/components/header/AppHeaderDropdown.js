import React, { useState, useEffect } from 'react';
import { useUser } from './../../context/UserContext';
import { fetchUserData } from './../../context/UserData';
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from './../../context/Security';

const BaseUrl = process.env.REACT_APP_BASE_URL

const AppHeaderDropdown = () => {
  const { keygenUser, logout } = useUser();
  const [profilePicturePath, setProfilePicturePath] = useState(null);
  const navigate = useNavigate();
  const { decrypt } = useSecurity();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (keygenUser) {
          const userData = await fetchUserData(keygenUser.userID, keygenUser.token);
          const relativePath = userData.profilePicturePath;
        
          // Set profile picture path based on condition
          setProfilePicturePath(relativePath ? `${BaseUrl}/${relativePath}?${new Date().getTime()}` : DefaultAvatar);

        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [keygenUser, setProfilePicturePath, decrypt]);

  const handleLogout = () => {
    logout();
    // Example: history.push('/login');
  };

  const handleProfileClick = () => {
    navigate(`/Profile`);
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={profilePicturePath} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem className='c-pointer' onClick={handleProfileClick}>
          <FontAwesomeIcon icon={faUser} className='me-3' />
          Profile
        </CDropdownItem>
        {/* <CDropdownItem className='c-pointer'>
          <FontAwesomeIcon icon={faGear}  className='me-3'/>
          Settings
        </CDropdownItem> */}
        <CDropdownDivider />
        <CDropdownItem className='c-pointer' onClick={handleLogout}>
          <i className="icon-arrow-thick-to-right me-2"></i>
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
}

export default AppHeaderDropdown;