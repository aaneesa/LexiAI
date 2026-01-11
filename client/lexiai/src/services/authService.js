import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";


const register = async (username,email,password) => {
    try{
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        username,
        email,
        password,
    });
    return response.data;
} catch (error) {
    throw error.response?.data || {message : "Registration failed"};   
}}

const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
};

const getProfile = async () => {    
    try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Fetching profile failed" };
    }
}

const updateProfile = async (profileData) => {    
    try {
        const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, profileData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Updating profile failed" };
    }
}

const changePassword = async (currentPassword, newPassword) => {    
    try {
        const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, {
            currentPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Changing password failed" };
    }
}

const authService = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
};

export default authService;