// UserData.js
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASE_URL;
const apiUserById = process.env.REACT_APP_API_USER_BY_ID;

export const fetchUserData = async (user_Id) => {
    try {
        if (!user_Id) {
            return null;
        }

        const response = await fetch(`${apiUserById}/${user_Id}`);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

export const updateProfilePicture = async (user_Id, image) => {
    try {
        const formData = new FormData();
        formData.append('image', image);

        const response = await axios.post(`${BaseUrl}/api/Users/upload/${user_Id}`, formData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw error;
    }
};
