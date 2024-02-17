import React, { useState, useEffect } from "react";
import UserTable from "./UserTable";
import { Link } from "react-router-dom";
import { Container, Button, Spinner } from "react-bootstrap"; // Import Spinner for loading indicator
const apiUrl = process.env.REACT_APP_API_USERS;


const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from the API
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        // Map properties to match UserTable expectations
        const mappedUsers = data.map((user) => ({
          userId: user.user_ID,
          email: user.emailAddress,
          name: `${user.firstName} ${user.middleName} ${user.lastName}`,
          mobileNumber: user.phoneNumber,
          designation: user.designation,
          profilePicturePath: user.profilePicturePath,
        }));

        setUsers(mappedUsers);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return (
    <Container className="userform border border-3 p-4 my-3">
      <div className="d-flex justify-content-between m-3">
        <h3>Users</h3>
        <Button as={Link} to="add-user/" className="btn">
          Add User
        </Button>
      </div>
      <hr />

      {loading ? ( // Display a loading spinner while data is being fetched
        <div className="text-center">
          <Spinner animation="border" role="status">
          </Spinner>
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </Container>
  );
};

export default AllUsers;
