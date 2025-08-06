import axiosClient from "../axiosClient";

export function register(userData) {
    try {
        return axiosClient.post('register', userData);
    } catch (err) {
        throw err;
    }
}