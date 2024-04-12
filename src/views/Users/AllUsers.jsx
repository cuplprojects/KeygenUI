import React, { useState, useEffect } from "react";
import UserTable from "./UserTable";
import { Link } from "react-router-dom";
import { Container, Button, Spinner } from "react-bootstrap";
import PermissionChecker from "./../../context/PermissionChecker";
import { useUser } from "./../../context/UserContext";

const apiUrl = process.env.REACT_APP_API_USERS; // Your API URL

const AllUsers = () => {
  const {keygenUser} = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl,{ headers: { Authorization: `Bearer ${keygenUser?.token}` } })
      .then((res) => res.json())
      .then((data) => {
        const mappedUsers = data.map((user) => ({
          userId: user.userID,
          email: user.emailAddress,
          name: `${user.firstName} ${user.middleName} ${user.lastName}`,
          mobileNumber: user.phoneNumber,
          designation: user.designation,
          profilePicturePath: user.profilePicturePath,
        }));

        setUsers(mappedUsers);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <PermissionChecker>
      {({ hasPermission }) => (
        <Container className="userform border border-3 p-4 my-3">
          <div className="d-flex justify-content-between m-3">
            <h3>Users</h3>
            {hasPermission(1, "can_Add") && (
              <Button as={Link} to="add-user/" className="btn">
                Add User
              </Button>
            )}
          </div>
          <hr />

          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <UserTable users={users} hasPermission={hasPermission} />
          )}
        </Container>
      )}
    </PermissionChecker>
  );
};

export default AllUsers;
