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
