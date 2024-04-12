import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useSecurity } from "./../../context/Security";
import { useUser } from './../../context/UserContext';
const moduleApi = process.env.REACT_APP_API_MODULES;
const permissionApi = process.env.REACT_APP_API_PERMISSION;


const UserPermissions = () => {
  const {keygenUser} = useUser();
  const { userId } = useParams();
  const { decrypt } = useSecurity();
  const decryptid = decrypt(userId)

  const [dupliError, setDupliError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [modulePermissions, setModulePermissions] = useState([]);
  const [errorText, setErrorText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatePermissions, setUpdatePermissions] = useState(false);


  useEffect(() => {
    axios.get(moduleApi,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then(response => {
        // setModules(response.data);
        // Initialize modulePermissions based on modules
        setModulePermissions(response.data.map(module => ({
          moduleID: module.moduleID,
          moduleName: module.moduleName,
          can_Add: false,
          can_View: false,
          can_Update: false,
          can_Delete: false,
        })));
        console.log(modulePermissions)
      })
      .catch(error => console.error(error));
  }, []);


  const handleInputChange = (moduleID, permissionType, checked) => {
    setModulePermissions((prevPermissions) =>
      prevPermissions.map((module) =>
        module.moduleID === moduleID
          ? {
              ...module,
              [permissionType]: checked,
              // Automatically grant additional permissions based on the updated permission
              ...(permissionType === 'can_Delete' && checked
                ? { can_View: true, can_Add: true, can_Update: true }
                : permissionType === 'can_Update' && checked
                ? { can_View: true, can_Add: true }
                : permissionType === 'can_Add' && checked
                ? { can_View: true }
                : {}),
            }
          : module
      )
    );
  };
  

  const onAddPermissions = () => {
    const permissionsArray = modulePermissions.map(({ moduleID, can_Add, can_View, can_Update, can_Delete }) => ({
      userId: decryptid,
      moduleID,
      can_Add,
      can_View,
      can_Update,
      can_Delete,
    }));

    console.log('Adding permissions for user:', decryptid);
    console.log('Permissions to be added:', permissionsArray);

    axios.post(permissionApi,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } }, permissionsArray)
      .then(response => {
        console.log('Permissions added successfully:', response.data);
        setSuccess(true);
        setDupliError(false);
        setSuccessMessage('Permissions added successfully!');
        // Reset the modulePermissions state if needed
        setModulePermissions([]);
      })
      .catch(error => {
        console.error(error);
        setDupliError(true);
        if (error.response && error.response.status === 500) {
          setErrorText('Permissions Already Added!');
          setUpdatePermissions(true)
        }
        setSuccess(false);
      })
      .finally(() => {
        // Reset other states or perform any cleanup if needed
        // setErrorText(''); // You may reset the error text here if required
      });
  };


  return (
    <div>
      <Container className="userform border border-3 p-4 my-3">
        <Form>
          <Form.Group controlId="formPermissions" className="text-center">
            <Form.Label className="userform border border-3 w-100 font-weight-bold"><h4>Permissions</h4></Form.Label>
            {/* success alert  */}
            {success && (
              <Alert
                variant="success"
                onClose={() => setSuccess(false)}
                dismissible
              >
                {successMessage}
              </Alert>
            )}
            {/* error alert  */}
            {dupliError && (
              <Alert
                variant="danger"
                onClose={() => setDupliError(false)}
                dismissible
              >
                {errorText}
                {
                  updatePermissions && (
                    <>&nbsp; Pls. Update Permissions. <br />
                   <Link to={`/users/view-user/${userId}`}>Update Permissions</Link>
                    </>
                  )
                }
              </Alert>
            )}
            <Table bordered responsive className="text-center">

              <thead>
                <tr>
                  <th>Module Name</th>
                  <th>Add</th>
                  <th>View</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {modulePermissions.map((module) => (
                  <tr key={module.moduleID}>
                    <td>{module.moduleName}</td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_Add}
                        onChange={(e) =>
                          handleInputChange(
                            module.moduleID,
                            'can_Add',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_View}
                        onChange={(e) =>
                          handleInputChange(
                            module.moduleID,
                            'can_View',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_Update}
                        onChange={(e) =>
                          handleInputChange(
                            module.moduleID,
                            'can_Update',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={module.can_Delete}
                        onChange={(e) =>
                          handleInputChange(
                            module.moduleID,
                            'can_Delete',
                            e.target.checked
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button variant="primary" type="button" onClick={onAddPermissions}>
              Add Permissions
            </Button>
          </Form.Group>
        </Form>
      </Container>
    </div>
  );
};

export default UserPermissions;
