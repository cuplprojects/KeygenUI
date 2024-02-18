import React, { useEffect, useRef } from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import { CSVLink } from 'react-csv';
import DefaultAvatar from './../../assets/images/avatars/defaultavatar.jpg';
import { faEye, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types'; // Import PropTypes

// import Security from '../../Security';


const UserTable = ({ users }) => {
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

  return (
    <div className="table-responsive">
      <Table striped bordered hover ref={tableRef} >
        <thead >
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

            <tr key={user.userId} >
              <td>{user.userId}</td>
              <td><img className="rounded-circle" src={user.profilePicturePath ? `https://localhost:7247/${user.profilePicturePath}` : DefaultAvatar}
                alt="" width="50px" height='50px' /></td>
              <td className='text-capitalize'>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.mobileNumber}</td>
              <td className='text-capitalize'>{user.designation}</td>
              <td>
                <div className="d-flex gap-3 text-primary">
                  <Link to={`view-user/${user.userId}`}>
                    <FontAwesomeIcon icon={faEye} className="text-success" />
                  </Link>
                  <Link to={`update-user/${user.userId}`}>
                    <FontAwesomeIcon icon={faPenToSquare} className="text-primary" />
                  </Link>
                  <Link to={`delete-user/${user.userId}`}>
                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end mt-3">
        <CSVLink
          data={users}
          headers={csvHeaders}
          filename={'user_data.csv'}
          className="btn btn-primary"
        >
          Download CSV
        </CSVLink>
      </div>
    </div>
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
};

export default UserTable;
