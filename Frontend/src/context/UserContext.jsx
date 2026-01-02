// import { createContext, useState, useEffect } from "react";

// export const UserContext = createContext();

// const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const authToken = localStorage.getItem("authToken");
//     setUser(authToken ? { authToken } : null);
//   }, []);

//   const login = (token) => {
//     localStorage.setItem("authToken", token);
//     setUser({ authToken: token });
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("authToken");
//   };

//   return (
//     <UserContext.Provider value={{ user, login, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export default UserProvider;

import { createContext, useState, useEffect } from "react";

// ✅ Create and export the context
export const UserContext = createContext();

// ✅ Create the provider component
export const UserProvider = ({ children }) => {
  // ✅ Initialize user from localStorage with FULL user data
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log("✅ UserContext: Initialized from localStorage");
        console.log("User data:", parsed);
        console.log("User role:", parsed.role);
        return parsed;
      }
    } catch (error) {
      console.error("❌ UserContext: Error parsing stored user:", error);
    }
    return null;
  });

  // ✅ NEW login function - accepts FULL user object + token
  const login = (userData, token) => {
    console.log("=== UserContext: Login Called ===");
    console.log("User data received:", userData);
    console.log("Token received:", token ? "EXISTS" : "MISSING");
    console.log("User role:", userData?.role);

    // Store token
    localStorage.setItem("token", token);
    localStorage.setItem("authToken", token); // Keep for backward compatibility
    
    // Store FULL user object
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Store role separately for easy access
    localStorage.setItem("role", userData.role);
    
    // Store branchId if exists
    if (userData.branchId) {
      localStorage.setItem("branchId", userData.branchId._id || userData.branchId);
    }

    // Update context state with FULL user object
    setUser(userData);
    
    console.log("✅ UserContext: User data stored successfully");
    console.log("Stored user:", userData);
  };

  // ✅ Logout function - clears everything
  const logout = () => {
    console.log("=== UserContext: Logout Called ===");
    
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("branchId");
    
    // Clear context state
    setUser(null);
    
    console.log("✅ UserContext: User logged out, all data cleared");
  };

  // ✅ Debug: Log user state changes
  useEffect(() => {
    console.log("=== UserContext: User State Changed ===");
    console.log("Current user:", user);
    console.log("User role:", user?.role);
    console.log("User name:", user?.name);
    console.log("Is Admin:", user?.role === "Admin");
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// ✅ Also export as default for flexibility
export default UserProvider;