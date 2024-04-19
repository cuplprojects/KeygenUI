// UserTable.js
import React, { useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import { CSVLink } from 'react-csv';
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useSecurity } from "./../../context/Security";
const baseUrl = process.env.REACT_APP_BASE_URL;

const UserTable = ({ users, hasPermission }) => {
  const { encrypt } = useSecurity();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    // Initialize DataTable
    $(tableRef.current).DataTable();
  }, []);

  const csvHeaders = [
    { label: 'User ID', key: 'userId' },
    { label: 'Name', key: 'name' },
    { label: 'Mobile Number', key: 'mobileNumber' },
    { label: 'Email Address', key: 'email' },
    { label: 'Designation', key: 'designation' }
  ];

  const handleRowClick = (userID) => {
    navigate(`view-user/${encrypt(userID)}`);
  };


  return (
    <>
      <div className="table-responsive">
        <Table striped bordered hover ref={tableRef}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Picture</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Designation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className='text-center'>
            {users.map((user) => (
              
              <tr className='c-pointer' key={user.userId} onClick={() => handleRowClick(user.userId)}>
                <td>{user.userId}</td>
                <td><img className="rounded-circle" src={user.profilePicturePath ? `${baseUrl}/${user.profilePicturePath}` : DefaultAvatar} alt="" width="50px" height='50px' /></td>
                <td className='text-capitalize'>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.mobileNumber}</td>
                <td className='text-capitalize'>{user.designation}</td>
                <td onClick={(event) => event.stopPropagation()}>
                  <div className="d-flex gap-3 text-primary justify-content-center">
                    {hasPermission(1, 'can_View') && <Link to={`view-user/${encrypt(user.userId)}`}><FontAwesomeIcon icon={faEye} className="text-success" /></Link>}
                    {hasPermission(1, 'can_Update') && <Link to={`update-user/${encrypt(user.userId)}`}><FontAwesomeIcon icon={faPenToSquare} className="text-primary" /></Link>}
                    {/* {hasPermission(1, 'can_Delete') && <Link to={`delete-user/${encrypt(user.userId)}`}><FontAwesomeIcon icon={faTrash} className="text-danger" /></Link>} */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div>
        <div className="d-flex justify-content-end mt-3">
          <CSVLink data={users} headers={csvHeaders} filename={'user_data.csv'} className="btn btn-primary">Download CSV</CSVLink>
        </div>
      </div>
    </>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      mobileNumber: PropTypes.string.isRequired,
      designation: PropTypes.string.isRequired,
      profilePicturePath: PropTypes.string // Assuming profilePicturePath is optional
    })
  ).isRequired,
  hasPermission: PropTypes.func.isRequired, // Ensure hasPermission is a function and is required
};

export default UserTable;
