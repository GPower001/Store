// import React, { useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import "./login.css";
// import api from "../utils/api";

// function Login() {
//     const [isRegistering, setIsRegistering] = useState(false);
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: "",
//     });
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     // Handle input changes
//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     // Handle form submission
//     const handleSubmit = async (e, type) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");

//         try {
//             // Determine the endpoint based on the form type
//             const endpoint = type === "register" ? "/api/auth/register" : "/api/auth/login";

//             // Use the environment variable for the base API URL
//             const response = await api.post(
//                 `${import.meta.env.VITE_SOCKET_URL_PROD}${endpoint}`,
//                 formData,
//                 { withCredentials: true } // Ensures cookies (if using JWT)
//             );
//             console.log("API URL:", import.meta.env.VITE_API_URL); // For Vite
//             console.log("Response:", response.data);
//             alert(response.data.message || "Success!");

//             // Handle login-specific actions
//             if (type === "login") {
//                 localStorage.setItem("authToken", response.data.token);
//                 window.location.href = "/dashboard"; // Redirect to the dashboard
//             }
//         } catch (err) {
//             // Display error message
//             setError(err.response?.data?.message || "An error occurred. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className={`content d-flex shadow-lg ${isRegistering ? "active" : ""}`} id="content">
//             {/* Registration Form */}
//             <div className="col-md-6 d-flex justify-content-center">
//                 <form onSubmit={(e) => handleSubmit(e, "register")}>
//                     <div className="header-text mb-4">
//                         <h1>Register</h1>
//                     </div>
//                     <div className="input-group mb-3">
//                         <input
//                             type="text"
//                             name="name"
//                             placeholder="Name"
//                             className="form-control form-control-lg"
//                             value={formData.name}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div className="input-group mb-3">
//                         <input
//                             type="email"
//                             name="email"
//                             placeholder="Email"
//                             className="form-control form-control-lg"
//                             value={formData.email}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div className="input-group mb-3">
//                         <input
//                             type="password"
//                             name="password"
//                             placeholder="Password"
//                             className="form-control form-control-lg"
//                             value={formData.password}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     {error && <p className="text-danger">{error}</p>}
//                     <div className="input-group mb-3 justify-content-center">
//                         <button
//                             type="submit"
//                             className="btn border-white text-white w-50 fs-6"
//                             disabled={loading}
//                         >
//                             {loading ? "Registering..." : "REGISTER"}
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {/* Login Form */}
//             <div className={`col-md-6 right-box ${isRegistering ? "d-none" : ""}`}>
//                 <form onSubmit={(e) => handleSubmit(e, "login")}>
//                     <div className="header-text mb-4">
//                         <h1>Log In</h1>
//                     </div>
//                     <div className="input-group mb-3">
//                         <input
//                             type="email"
//                             name="email"
//                             placeholder="Email"
//                             className="form-control form-control-lg"
//                             value={formData.email}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div className="input-group mb-3">
//                         <input
//                             type="password"
//                             name="password"
//                             placeholder="Password"
//                             className="form-control form-control-lg"
//                             value={formData.password}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>
//                     <div className="input-group mb-5 d-flex justify-content-between">
//                         <div className="form-check">
//                             <input type="checkbox" className="form-check-input" />
//                             <label className="form-check-label text-secondary">
//                                 <small>Remember me</small>
//                             </label>
//                         </div>
//                         <div className="forgot">
//                             <small>
//                                 <a href="#">Forgot password?</a>
//                             </small>
//                         </div>
//                     </div>
//                     {error && <p className="text-danger">{error}</p>}
//                     <div className="input-group mb-3 justify-content-center">
//                         <button
//                             type="submit"
//                             className="btn border-white text-white w-50 fs-6"
//                             disabled={loading}
//                         >
//                             {loading ? "Logging in..." : "LOGIN"}
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {/* Switch Panel */}
//             <div className="switch-content">
//                 <div className="switch">
//                     <div className="switch-panel switch-left">
//                         <h1>Hello</h1>
//                         <p>We are happy to see you back</p>
//                         <button
//                             className="btn border-white text-white w-50 fs-6"
//                             onClick={() => setIsRegistering(false)}
//                         >
//                             LOGIN
//                         </button>
//                     </div>
//                     <div className="switch-panel switch-right">
//                         <h1>Welcome</h1>
//                         <p>Sign Up</p>
//                         <button
//                             className="btn border-white text-white w-50 fs-6"
//                             onClick={() => setIsRegistering(true)}
//                         >
//                             REGISTER
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Login;


// import React, { useState } from "react";
// import "./login.css";
// import api from "../utils/api";

// const Login = () => {
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//         // Determine the endpoint based on the form type
//         const endpoint = "/api/auth/login"; // Since registration is not needed, we only use the login endpoint
      
//         // Use the environment variable for the base API URL
//         const response = await api.post(
//           `${import.meta.env.VITE_SOCKET_URL_PROD}${endpoint}`, // Use the environment variable for the base URL
//           { name, password }, // Pass the login credentials
//           { withCredentials: true } // Ensures cookies (e.g., for JWT)
//         );
      
//         console.log("API URL:", import.meta.env.VITE_SOCKET_URL_PROD); // For debugging
//         console.log("Response:", response.data);
//         alert(response.data.message || "Login successful!");
      
//         // Handle login-specific actions
//         localStorage.setItem("authToken", response.data.token); // Save token to localStorage
//         window.location.href = "/dashboard"; // Redirect to the dashboard
//       } catch (err) {
//         // Display error message
//         console.error("Login error:", err.response?.data || err.message);
//         setError(err.response?.data?.message || "An error occurred. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#fcf4fb" }}>
//       <div className="card p-4 shadow-lg rounded-3" style={{ width: "350px", backgroundColor: "#ffffff" }}>
//         <h2 className="text-center fw-bold welcome-text">Welcome Back</h2>
//         <p className="text-center text-muted">Please login to continue</p>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label fw-semibold">Name:</label>
//             <input
//               type="text"
//               className="form-control custom-input"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label fw-semibold">Password:</label>
//             <input
//               type="password"
//               className="form-control custom-input"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           {error && <p className="text-danger">{error}</p>}
//           <button type="submit" className="btn w-100 fw-bold login-btn" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//         <p className="text-center mt-3">
//           <a href="#" className="text-primary text-decoration-none">Forgot Password?</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;

// import React, { useState } from "react";
// import "./login.css";
// import axios from "axios";

// const Login = () => {
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//         // Determine the base URL based on the environment
//         const baseURL =
//           import.meta.env.MODE === "production"
//             ? import.meta.env.VITE_SOCKET_URL_PROD // Use production URL
//             : import.meta.env.VITE_SOCKET_URL_DEV; // Use development URL
      
//         // Send a POST request to the backend login endpoint
//         const response = await axios.post(
//           `${baseURL}/api/auth/login`, // Dynamically use the correct base URL
//           { name, password }, // Login credentials
//           { withCredentials: true } // Include credentials (e.g., cookies) if needed
//         );
      
//         console.log("Login successful:", response.data); // Log the response
//         alert(response.data.message || "Login successful!"); // Show success message
//         localStorage.setItem("authToken", response.data.token); // Save token to localStorage
//         window.location.href = "/dashboard"; // Redirect to the dashboard
//       } catch (err) {
//         console.error("Login error:", err.response?.data || err.message); // Log the error
//         setError(err.response?.data?.message || "An error occurred. Please try again."); // Display error message
//       } finally {
//         setLoading(false); // Stop the loading spinner
//       }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#fcf4fb" }}>
//       <div className="card p-4 shadow-lg rounded-3" style={{ width: "350px", backgroundColor: "#ffffff" }}>
//         <h2 className="text-center fw-bold welcome-text">Welcome Back</h2>
//         <p className="text-center text-muted">Please login to continue</p>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label fw-semibold">Name:</label>
//             <input
//               type="text"
//               className="form-control custom-input"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label fw-semibold">Password:</label>
//             <input
//               type="password"
//               className="form-control custom-input"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           {error && <p className="text-danger">{error}</p>}
//           <button type="submit" className="btn w-100 fw-bold login-btn" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;








// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import "./login.css";
// import api from "../utils/api";

// function Login() {
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     password: "",
//     branchId: "",
//     branchName: "",
//     role: "Nurse",
//   });
//   const [branches, setBranches] = useState([]); // ✅ will store branches
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Fetch available branches from API
//     const fetchBranches = async () => {
//       try {
//         const res = await api.get("/api/branches");
//         console.log("Branches API response:", res.data); // 👀 debug
//         setBranches(Array.isArray(res.data) ? res.data : res.data.branches || []);
//       } catch (err) {
//         console.error("Error fetching branches:", err);
//         setBranches([]); // fallback to empty array
//       }
//     };
//     fetchBranches();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e, type) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const endpoint =
//         type === "register" ? "/api/auth/register" : "/api/auth/login";

//       const payload =
//         type === "register"
//           ? {
//               name: formData.name,
//               password: formData.password,
//               role: formData.role,
//               // ✅ only send branchId if not empty
//               ...(formData.branchId
//                 ? { branchId: formData.branchId }
//                 : { branchName: formData.branchName }),
//             }
//           : {
//               name: formData.name,
//               password: formData.password,
//             };

//       const response = await api.post(endpoint, payload, {
//         withCredentials: true,
//       });

//       alert(response.data.message || "Success!");

//       if (type === "login") {
//         localStorage.setItem("authToken", response.data.token);
//         window.location.href = "/dashboard";
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || "An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className={`content d-flex shadow-lg ${isRegistering ? "active" : ""}`}
//       id="content"
//     >
//       {/* Registration Form */}
//       <div className="col-md-6 d-flex justify-content-center">
//         <form onSubmit={(e) => handleSubmit(e, "register")}>
//           <div className="header-text mb-4">
//             <h1>Register</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Branch Selection */}
//           <div className="input-group mb-3">
//             <select
//               name="branchId"
//               className="form-control form-control-lg"
//               value={formData.branchId}
//               onChange={handleChange}
//             >
//               <option value="">Create New Branch</option>
//               {branches.map((b) => (
//                 <option key={b._id} value={b._id}>
//                   {b.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* If creating a new branch */}
//           {!formData.branchId && (
//             <div className="input-group mb-3">
//               <input
//                 type="text"
//                 name="branchName"
//                 placeholder="New Branch Name"
//                 className="form-control form-control-lg"
//                 value={formData.branchName}
//                 onChange={handleChange}
//               />
//             </div>
//           )}

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button
//               type="submit"
//               className="btn border-white text-white w-50 fs-6"
//               disabled={loading}
//             >
//               {loading ? "Registering..." : "REGISTER"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Login Form */}
//       <div className={`col-md-6 right-box ${isRegistering ? "d-none" : ""}`}>
//         <form onSubmit={(e) => handleSubmit(e, "login")}>
//           <div className="header-text mb-4">
//             <h1>Log In</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button
//               type="submit"
//               className="btn border-white text-white w-50 fs-6"
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "LOGIN"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Switch Panel */}
//       <div className="switch-content">
//         <div className="switch">
//           <div className="switch-panel switch-left">
//             <h1>Hello</h1>
//             <p>We are happy to see you back</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(false)}
//             >
//               LOGIN
//             </button>
//           </div>
//           <div className="switch-panel switch-right">
//             <h1>Welcome</h1>
//             <p>Sign Up</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(true)}
//             >
//               REGISTER
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;


// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import "./login.css";
// import api from "../utils/api";
// import { useAuthStore } from "../store/useAuthStore";

// function Login() {
//   const { setAuth } = useAuthStore();
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     password: "",
//     branchId: "",
//     branchName: "",
//     role: "Nurse",
//   });
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await api.get("/api/branches");
//         setBranches(Array.isArray(res.data) ? res.data : res.data.branches || []);
//       } catch (err) {
//         console.error("Error fetching branches:", err);
//         setBranches([]);
//       }
//     };
//     fetchBranches();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e, type) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const endpoint = type === "register" ? "/api/auth/register" : "/api/auth/login";

//       const payload =
//         type === "register"
//           ? {
//               name: formData.name,
//               password: formData.password,
//               role: formData.role,
//               ...(formData.branchId
//                 ? { branchId: formData.branchId }
//                 : { branchName: formData.branchName }),
//             }
//           : {
//               name: formData.name,
//               password: formData.password,
//             };

//       const response = await api.post(endpoint, payload, { withCredentials: true });

//       alert(response.data.message || "Success!");

//       if (type === "login") {
//         // ✅ Save into Zustand + localStorage
//         setAuth({
//           user: response.data.user,
//           token: response.data.token,
//         });

//         // redirect
//         window.location.href = "/dashboard";
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || "An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={`content d-flex shadow-lg ${isRegistering ? "active" : ""}`} id="content">
//       {/* Registration Form */}
//       <div className="col-md-6 d-flex justify-content-center">
//         <form onSubmit={(e) => handleSubmit(e, "register")}>
//           <div className="header-text mb-4">
//             <h1>Register</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Role Selection */}
//           <div className="input-group mb-3">
//             <select
//               name="role"
//               className="form-control form-control-lg"
//               value={formData.role}
//               onChange={handleChange}
//             >
//               <option value="Nurse">Nurse</option>
//               <option value="Doctor">Doctor</option>
//               <option value="Admin">Admin</option>
//             </select>
//           </div>

//           {/* Branch Selection */}
//           <div className="input-group mb-3">
//             <select
//               name="branchId"
//               className="form-control form-control-lg"
//               value={formData.branchId}
//               onChange={handleChange}
//             >
//               <option value="">Create New Branch</option>
//               {branches.map((b) => (
//                 <option key={b._id} value={b._id}>
//                   {b.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* If creating a new branch */}
//           {!formData.branchId && (
//             <div className="input-group mb-3">
//               <input
//                 type="text"
//                 name="branchName"
//                 placeholder="New Branch Name"
//                 className="form-control form-control-lg"
//                 value={formData.branchName}
//                 onChange={handleChange}
//               />
//             </div>
//           )}

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button
//               type="submit"
//               className="btn border-white text-white w-50 fs-6"
//               disabled={loading}
//             >
//               {loading ? "Registering..." : "REGISTER"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Login Form */}
//       <div className={`col-md-6 right-box ${isRegistering ? "d-none" : ""}`}>
//         <form onSubmit={(e) => handleSubmit(e, "login")}>
//           <div className="header-text mb-4">
//             <h1>Log In</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button
//               type="submit"
//               className="btn border-white text-white w-50 fs-6"
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "LOGIN"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Switch Panel */}
//       <div className="switch-content">
//         <div className="switch">
//           <div className="switch-panel switch-left">
//             <h1>Hello</h1>
//             <p>We are happy to see you back</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(false)}
//             >
//               LOGIN
//             </button>
//           </div>
//           <div className="switch-panel switch-right">
//             <h1>Welcome</h1>
//             <p>Sign Up</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(true)}
//             >
//               REGISTER
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;







// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import "./login.css";
// import api from "../utils/api";
// import { useAuthStore } from "../store/useAuthStore";

// function Login() {
//   const { setAuth } = useAuthStore();
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     password: "",
//     branchId: "",
//     role: "Nurse",
//   });
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ✅ Fetch branches on mount (needed for registration)
//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await api.get("/branches");
//         setBranches(res.data?.data || []); // backend returns { success, data }
//       } catch (err) {
//         console.error("Error fetching branches:", err);
//         setBranches([]);
//       }
//     };
//     fetchBranches();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e, type) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const endpoint = type === "register" ? "/auth/register" : "/auth/login";

//       const payload =
//         type === "register"
//           ? {
//               name: formData.name,
//               password: formData.password,
//               role: formData.role,
//               branchId: formData.branchId || undefined, // user selects branch at registration
//             }
//           : {
//               name: formData.name,
//               password: formData.password,
//               role: formData.role,
//             };

//       const response = await api.post(endpoint, payload, { withCredentials: true });

//       alert(response.data.message || "Success!");

//       if (type === "login") {
//         const user = response.data.user;
//         const token = response.data.token;

//         // ✅ Use branch from backend, not user input
//         const branchId = user.branchId?._id || user.branchId;

//         // Save auth data
//         setAuth({ user, token, branchId });
//         localStorage.setItem("token", token);
//         localStorage.setItem("branchId", branchId);

//         window.location.href = "/dashboard";
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || "An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className={`content d-flex shadow-lg ${isRegistering ? "active" : ""}`}
//       id="content"
//     >
//       {/* Registration Form */}
//       <div className="col-md-6 d-flex justify-content-center">
//         <form onSubmit={(e) => handleSubmit(e, "register")}>
//           <div className="header-text mb-4">
//             <h1>Register</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Branch Dropdown (Register only) */}
//           <div className="input-group mb-3">
//             <select
//               name="branchId"
//               className="form-control form-control-lg"
//               value={formData.branchId}
//               onChange={handleChange}
//               required
//             >
//               <option value="">Select Branch</option>
//               {branches.map((b) => (
//                 <option key={b._id} value={b._id}>
//                   {b.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Role Selection */}
//           <div className="input-group mb-3">
//             <select
//               name="role"
//               className="form-control form-control-lg"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="Nurse">Nurse</option>
//               <option value="Doctor">Doctor</option>
//               <option value="Admin">Admin</option>
//             </select>
//           </div>

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button
//               type="submit"
//               className="btn border-white text-white w-50 fs-6"
//               disabled={loading}
//             >
//               {loading ? "Registering..." : "REGISTER"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Login Form */}
//       <div className={`col-md-6 right-box ${isRegistering ? "d-none" : ""}`}>
//         <form onSubmit={(e) => handleSubmit(e, "login")}>
//           <div className="header-text mb-4">
//             <h1>Log In</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* 🚫 Removed Branch Selection from Login */}

//           {/* Role Selection (Login) */}
//           <div className="input-group mb-3">
//             <select
//               name="role"
//               className="form-control form-control-lg"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="Nurse">Nurse</option>
//               <option value="Doctor">Doctor</option>
//               <option value="Admin">Admin</option>
//             </select>
//           </div>

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button
//               type="submit"
//               className="btn border-white text-white w-50 fs-6"
//               disabled={loading}
//             >
//               {loading ? "Logging in..." : "LOGIN"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Switch Panel */}
//       <div className="switch-content">
//         <div className="switch">
//           <div className="switch-panel switch-left">
//             <h1>Hello</h1>
//             <p>We are happy to see you back</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(false)}
//             >
//               LOGIN
//             </button>
//           </div>
//           <div className="switch-panel switch-right">
//             <h1>Welcome</h1>
//             <p>Sign Up</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(true)}
//             >
//               REGISTER
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;

// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import "./login.css";
// import api from "../utils/api";
// import { useAuthStore } from "../store/useAuthStore";

// function Login() {
//   const { setAuth } = useAuthStore();
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     password: "",
//     branchId: "",
//     role: "Nurse",
//   });
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ✅ Fetch branches on mount (for registration)
//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await api.get("/api/branches");
//         console.log("Branches response:", res.data);
//         setBranches(res.data?.data || []);
//       } catch (err) {
//         console.error("Error fetching branches:", err);
//         setBranches([]);
//       }
//     };
//     fetchBranches();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e, type) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const endpoint = type === "register" ? "/auth/register" : "/auth/login";

//       const payload =
//         type === "register"
//           ? {
//               name: formData.name,
//               password: formData.password,
//               role: formData.role,
//               // ✅ Only send branchId if not Admin
//               ...(formData.role !== "Admin" && { branchId: formData.branchId }),
//             }
//           : {
//               name: formData.name,
//               password: formData.password, // ✅ no role here
//             };

//       const response = await api.post(endpoint, payload, { withCredentials: true });

//       alert(response.data.message || "Success!");

//       if (type === "login") {
//         const user = response.data.user;
//         const token = response.data.token;

//         // ✅ Use branch from backend, not from input
//         const branchId = user.branchId?._id || user.branchId || null;

//         setAuth({ user, token, branchId });
//         localStorage.setItem("token", token);
//         if (branchId) localStorage.setItem("branchId", branchId);

//         window.location.href = "/dashboard";
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || "An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={`content d-flex shadow-lg ${isRegistering ? "active" : ""}`} id="content">
//       {/* Registration Form */}
//       <div className="col-md-6 d-flex justify-content-center">
//         <form onSubmit={(e) => handleSubmit(e, "register")}>
//           <div className="header-text mb-4">
//             <h1>Register</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* ✅ Branch Dropdown only if not Admin */}
//           {formData.role !== "Admin" && (
//             <div className="input-group mb-3">
//               <select
//                 name="branchId"
//                 className="form-control form-control-lg"
//                 value={formData.branchId}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select Branch</option>
//                 {branches.map((b) => (
//                   <option key={b._id} value={b._id}>
//                     {b.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Role Selection */}
//           <div className="input-group mb-3">
//             <select
//               name="role"
//               className="form-control form-control-lg"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="Nurse">Nurse</option>
//               <option value="Doctor">Doctor</option>
//               <option value="Admin">Admin</option>
//             </select>
//           </div>

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button type="submit" className="btn border-white text-white w-50 fs-6" disabled={loading}>
//               {loading ? "Registering..." : "REGISTER"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Login Form */}
//       <div className={`col-md-6 right-box ${isRegistering ? "d-none" : ""}`}>
//         <form onSubmit={(e) => handleSubmit(e, "login")}>
//           <div className="header-text mb-4">
//             <h1>Log In</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* 🚫 Removed Branch Selection from Login */}

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button type="submit" className="btn border-white text-white w-50 fs-6" disabled={loading}>
//               {loading ? "Logging in..." : "LOGIN"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Switch Panel */}
//       <div className="switch-content">
//         <div className="switch">
//           <div className="switch-panel switch-left">
//             <h1>Hello</h1>
//             <p>We are happy to see you back</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(false)}
//             >
//               LOGIN
//             </button>
//           </div>
//           <div className="switch-panel switch-right">
//             <h1>Welcome</h1>
//             <p>Sign Up</p>
//             <button
//               className="btn border-white text-white w-50 fs-6"
//               onClick={() => setIsRegistering(true)}
//             >
//               REGISTER
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;







// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import "./login.css";
// import api from "../utils/api";
// import { useAuthStore } from "../store/useAuthStore";

// function Login() {
//   const { setAuth } = useAuthStore();
//   const [isRegistering, setIsRegistering] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     password: "",
//     branchId: "",
//     role: "Nurse",
//   });
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ✅ Fetch branches on mount
//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await api.get("/api/branches");
//         setBranches(res.data?.data || []); // ✅ backend returns { success, data }
//       } catch (err) {
//         console.error("Error fetching branches:", err);
//         setBranches([]);
//       }
//     };
//     fetchBranches();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e, type) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const endpoint = type === "register" ? "/api/auth/register" : "/api/auth/login";

//       const payload =
//         type === "register"
//           ? {
//               name: formData.name,
//               password: formData.password,
//               role: formData.role,
//               branchId: formData.branchId || undefined, // ✅ if user selects branch
//             }
//           : {
//               name: formData.name,
//               password: formData.password,
//               branchId: formData.branchId,
//               role: formData.role,
//             };

//       const response = await api.post(endpoint, payload, { withCredentials: true });

//       alert(response.data.message || "Success!");

//       if (type === "login") {
//         setAuth({
//           user: response.data.user,
//           token: response.data.token,
//         });
//         window.location.href = "/dashboard";
//       }
//     } catch (err) {
//       setError(err.response?.data?.error || "An error occurred. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={`content d-flex shadow-lg ${isRegistering ? "active" : ""}`} id="content">
//       {/* Registration Form */}
//       <div className="col-md-6 d-flex justify-content-center">
//         <form onSubmit={(e) => handleSubmit(e, "register")}>
//           <div className="header-text mb-4">
//             <h1>Register</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Branch Dropdown (Register only) */}
//           <div className="input-group mb-3">
//             <select
//               name="branchId"
//               className="form-control form-control-lg"
//               value={formData.branchId}
//               onChange={handleChange}
//             >
//               <option value="">Select Branch</option>
//               {branches.map((b) => (
//                 <option key={b._id} value={b._id}>
//                   {b.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Role Selection */}
//           <div className="input-group mb-3">
//             <select
//               name="role"
//               className="form-control form-control-lg"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="Nurse">Nurse</option>
//               <option value="Doctor">Doctor</option>
//               <option value="Admin">Admin</option>
//             </select>
//           </div>

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button type="submit" className="btn border-white text-white w-50 fs-6" disabled={loading}>
//               {loading ? "Registering..." : "REGISTER"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Login Form */}
//       <div className={`col-md-6 right-box ${isRegistering ? "d-none" : ""}`}>
//         <form onSubmit={(e) => handleSubmit(e, "login")}>
//           <div className="header-text mb-4">
//             <h1>Log In</h1>
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="text"
//               name="name"
//               placeholder="Username"
//               className="form-control form-control-lg"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="input-group mb-3">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               className="form-control form-control-lg"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Branch Dropdown (Login) */}
//           <div className="input-group mb-3">
//             <select
//               name="branchId"
//               className="form-control form-control-lg"
//               value={formData.branchId}
//               onChange={handleChange}

//             >
//               <option value="">Select Branch</option>
//               {branches.map((b) => (
//                 <option key={b._id} value={b._id}>
//                   {b.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Role Selection (Login) */}
//           <div className="input-group mb-3">
//             <select
//               name="role"
//               className="form-control form-control-lg"
//               value={formData.role}
//               onChange={handleChange}
//               required
//             >
//               <option value="Nurse">Nurse</option>
//               <option value="Doctor">Doctor</option>
//               <option value="Admin">Admin</option>
//             </select>
//           </div>

//           {error && <p className="text-danger">{error}</p>}
//           <div className="input-group mb-3 justify-content-center">
//             <button type="submit" className="btn border-white text-white w-50 fs-6" disabled={loading}>
//               {loading ? "Logging in..." : "LOGIN"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Switch Panel */}
//       <div className="switch-content">
//         <div className="switch">
//           <div className="switch-panel switch-left">
//             <h1>Hello</h1>
//             <p>We are happy to see you back</p>
//             <button className="btn border-white text-white w-50 fs-6" onClick={() => setIsRegistering(false)}>
//               LOGIN
//             </button>
//           </div>
//           <div className="switch-panel switch-right">
//             <h1>Welcome</h1>
//             <p>Sign Up</p>
//             <button className="btn border-white text-white w-50 fs-6" onClick={() => setIsRegistering(true)}>
//               REGISTER
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./login.css";
import api from "../utils/api";
import { useAuthStore } from "../store/useAuthStore";
import { UserContext } from "../context/UserContext";

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const userContext = useContext(UserContext);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    branchId: "",
    role: "Nurse",
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/api/branches");
        console.log("Branches response:", res.data);
        // Handle both response formats: { data: [...] } or direct array
        setBranches(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Error fetching branches:", err);
        setBranches([]);
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = type === "register" ? "/api/auth/register" : "/api/auth/login";

      // ✅ CRITICAL FIX: For login, ONLY send name and password
      // Backend will return the user's actual role and branch
      const payload =
        type === "register"
          ? {
              name: formData.name,
              password: formData.password,
              role: formData.role,
              branchId: formData.branchId || undefined,
            }
          : {
              // ✅ LOGIN: Only username and password
              name: formData.name,
              password: formData.password,
              // DON'T send role or branchId - backend determines these
            };

      console.log(`=== ${type.toUpperCase()} REQUEST ===`);
      console.log("Payload:", payload);
      
      const response = await api.post(endpoint, payload, { withCredentials: true });
      
      console.log(`=== ${type.toUpperCase()} RESPONSE ===`);
      console.log("Full response:", response.data);

      if (type === "login") {
        const { user, token } = response.data;
        
        console.log("=== LOGIN SUCCESS ===");
        console.log("User object:", user);
        console.log("User name:", user?.name);
        console.log("User role:", user?.role);
        console.log("User branchId:", user?.branchId);
        console.log("Token:", token);
        console.log("Is Admin?", user?.role === "Admin");

        // ✅ CRITICAL: Store everything properly
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        
        // Also store branchId if exists
        if (user.branchId) {
          localStorage.setItem("branchId", user.branchId._id || user.branchId);
        }

        // ✅ Update Zustand store
        setAuth({
          user: user,
          token: token,
          branchId: user.branchId?._id || user.branchId || null,
        });

        // ✅ Update Context if available
        if (userContext?.login) {
          userContext.login(user, token);
        } else if (userContext?.setUser) {
          userContext.setUser(user);
        }

        console.log("=== STORED DATA CHECK ===");
        console.log("localStorage token:", localStorage.getItem("token"));
        console.log("localStorage user:", localStorage.getItem("user"));
        console.log("localStorage role:", localStorage.getItem("role"));

        // ✅ CRITICAL FIX: Redirect based on actual user role from backend
        if (user.role === "Admin") {
          console.log("✅ ADMIN LOGIN - Redirecting to /dashboard/admin");
          setTimeout(() => {
            navigate("/dashboard/admin", { replace: true });
          }, 100);
        } else {
          console.log("✅ USER LOGIN - Redirecting to /dashboard");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 100);
        }
        
      } else {
        // Registration successful
        alert(response.data.message || "Registration successful! Please login.");
        setIsRegistering(false);
        // Clear form
        setFormData({
          name: "",
          password: "",
          branchId: "",
          role: "Nurse",
        });
      }
      
    } catch (err) {
      console.error(`=== ${type.toUpperCase()} ERROR ===`);
      console.error("Error object:", err);
      console.error("Error response:", err.response);
      
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        "An error occurred. Please try again.";
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`content d-flex shadow-lg ${isRegistering ? "active" : ""}`} id="content">
      {/* Registration Form */}
      <div className="col-md-6 d-flex justify-content-center">
        <form onSubmit={(e) => handleSubmit(e, "register")}>
          <div className="header-text mb-4">
            <h1>Register</h1>
          </div>

          <div className="input-group mb-3">
            <input
              type="text"
              name="name"
              placeholder="Username"
              className="form-control form-control-lg"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control form-control-lg"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection (Register) */}
          <div className="input-group mb-3">
            <select
              name="role"
              className="form-control form-control-lg"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Nurse">Nurse</option>
              <option value="Doctor">Doctor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Branch Dropdown (Register) - Hide for Admin */}
          {formData.role !== "Admin" && (
            <div className="input-group mb-3">
              <select
                name="branchId"
                className="form-control form-control-lg"
                value={formData.branchId}
                onChange={handleChange}
                required
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name || b.branchName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.role === "Admin" && (
            <div className="alert alert-info text-center mb-3">
              Admins don't need a branch
            </div>
          )}

          {error && isRegistering && <p className="text-danger text-center">{error}</p>}
          
          <div className="input-group mb-3 justify-content-center">
            <button 
              type="submit" 
              className="btn border-white text-white w-50 fs-6" 
              disabled={loading}
            >
              {loading ? "Registering..." : "REGISTER"}
            </button>
          </div>
        </form>
      </div>

      {/* Login Form */}
      <div className={`col-md-6 right-box ${isRegistering ? "d-none" : ""}`}>
        <form onSubmit={(e) => handleSubmit(e, "login")}>
          <div className="header-text mb-4">
            <h1>Log In</h1>
          </div>

          <div className="input-group mb-3">
            <input
              type="text"
              name="name"
              placeholder="Username"
              className="form-control form-control-lg"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group mb-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control form-control-lg"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/*  REMOVED: Don't show branch or role selection for login */}
          {/* The backend will return the user's actual role and branch */}

          {error && !isRegistering && <p className="text-danger text-center">{error}</p>}
          
          <div className="input-group mb-3 justify-content-center">
            <button 
              type="submit" 
              className="btn border-white text-white w-50 fs-6" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              Enter your username and password
            </small>
          </div>
        </form>
      </div>

      {/* Switch Panel */}
      <div className="switch-content">
        <div className="switch">
          <div className="switch-panel switch-left">
            <h1>Hello</h1>
            <p>We are happy to see you back</p>
            <button 
              className="btn border-white text-white w-50 fs-6" 
              onClick={() => {
                setIsRegistering(false);
                setError("");
              }}
            >
              LOGIN
            </button>
          </div>
          <div className="switch-panel switch-right">
            <h1>Welcome</h1>
            <p>Sign Up</p>
            <button 
              className="btn border-white text-white w-50 fs-6" 
              onClick={() => {
                setIsRegistering(true);
                setError("");
              }}
            >
              REGISTER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;