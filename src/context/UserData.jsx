// UserData.js
import axios from 'axios';

const BaseUrl = process.env.REACT_APP_BASE_URL;
const apiUserById = process.env.REACT_APP_API_USER_BY_ID;

export const fetchUserData = async (userId,token) => {

    try {
        if (!userId) {
            return null;
        }

        const response = await fetch(`${apiUserById}/${userId}`,{
            headers:{
              Authorization: `Bearer ${token}`
            }
          });
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

export const updateProfilePicture = async (userId, image, token) => {
    try {
        const formData = new FormData();
        formData.append('image', image);

        const response = await axios.post(`${BaseUrl}/api/Users/upload/${userId}`, formData,{
            headers:{
              Authorization: `Bearer ${token}`
            }
          });
        return response.data;
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw error;
    }
};
