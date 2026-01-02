// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000", // For Vite
//   // For React (non-Vite), use:
//   // baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
//   withCredentials: true, // If cookies are required
// });

// export default api;


import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Always hit backend API through /api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL_DEV || "http://localhost:5000",
  withCredentials: true,
});

// Request interceptor to attach token + branchId
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || localStorage.getItem("token");
    let branchId = useAuthStore.getState().branchId || localStorage.getItem("branchId");

    // ✅ FIX: Filter out invalid branchId values
    if (branchId === 'null' || branchId === 'undefined' || branchId === '' || !branchId) {
      branchId = null;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ FIX: Only add x-branch-id header if it's valid
    if (branchId && branchId !== 'null' && branchId !== 'undefined') {
      config.headers["x-branch-id"] = branchId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;



// import axios from "axios";
// import { useAuthStore } from "../store/useAuthStore";

// // Detect environment
// const isProd = import.meta.env.MODE === "production";

// const api = axios.create({
//   baseURL: isProd
//     ? "https://inventory-sycr.onrender.com/api" // ✅ Production
//     : "http://localhost:5000/api",             // ✅ Local Dev
//   withCredentials: true,
// });

// // Attach token + branchId from store/localStorage
// api.interceptors.request.use(
//   (config) => {
//     const token = useAuthStore.getState().token || localStorage.getItem("token");
//     const branchId =
//       useAuthStore.getState().branchId || localStorage.getItem("branchId");

//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     if (branchId) config.headers["x-branch-id"] = branchId;

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;
