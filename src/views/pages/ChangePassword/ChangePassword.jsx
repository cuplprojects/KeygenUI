import React from 'react';
import PageLayout from '../PageLayout/PageLayout';
import ChangePasswordForm from './ChangePasswordForm';


const ChangePassword = () => {
  const heading = 'Change Password'

  return (
    <PageLayout>
      <ChangePasswordForm heading={heading}/>
    </PageLayout>
  );
};

export default ChangePassword;
