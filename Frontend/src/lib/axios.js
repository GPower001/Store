import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL_PROD || 
  (import.meta.env.PROD
    ? "https://inventory-management-3-pd8c.onrender.com/api" // Update to the correct production URL
    : "http://localhost:5000/api"),
  withCredentials: true, // Include credentials (cookies) in requests
});