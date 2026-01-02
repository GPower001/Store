// import { createBrowserRouter, Navigate } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import DashboardLayout from "./layout/DashboardLayout";
// import Inventory from "./pages/Inventory";
// import AddItems from "./pages/AddItems";
// import AddItemPage from "./components/AddItemPage";
// import MedicationPage from "./components/MedicationPage";
// import ConsumablePage from "./components/ConsumablePage";
// import GeneralPage from "./components/GeneralPage";
// import Login from "./components/Login";
// import AdjustStockPage from "./pages/AdjustStockPage";
// import LowStockPage from "./pages/LowStockPage";
// import ItemCategoryPage from "./pages/ItemCategoryPage";
// import ExpiredItems from "./pages/ExpiredItemPage";
// import SkinCarePage from "./pages/SkinCarePage";
// import MedicationFridgePage from "./pages/MedicationFridgePage";
// import AparatusPage from "./pages/AparatusPage";


// // Protected Route as a Component
// const ProtectedRoute = ({ children }) => {
//   const authToken = localStorage.getItem("token"); //match your useAuthStore
//   return authToken ? children : <Navigate to="/login" replace />;
// };


// const router = createBrowserRouter([
//   { path: "/", element: <Navigate to="/dashboard" replace /> },
//   { path: "/login", element: <Login /> },
//   {
//     path: "/dashboard",
//     element: (
//       <ProtectedRoute>
//         <DashboardLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <Dashboard /> },
//       { path: "inventory", element: <Inventory /> },
//       { path: "add-item", element: <AddItems /> },
//       { path: "add_item", element: <AddItemPage /> },
//       { path: "adjust-stock", element: <AdjustStockPage/>},
//       { path: "/dashboard/inventory/medication", element: <MedicationPage /> },
//       { path: "/dashboard/inventory/consumables", element: <ConsumablePage /> },
//       { path: "/dashboard/inventory/general", element: <GeneralPage /> },
//       { path: "/dashboard/inventory/skincare", element: <SkinCarePage /> },
//       { path: "/dashboard/inventory/medication-fridge", element: <MedicationFridgePage /> },
//       { path: "/dashboard/inventory/aparatus", element: <AparatusPage /> },
//       { path: "Low-stock", element: <LowStockPage /> },
//       { path: "categories", element: <ItemCategoryPage /> },
//       { path: "expired-products", element: <ExpiredItems /> },
//     ],
//   },
//   { path: "*", element: <Navigate to="/dashboard" replace /> },
// ]);

// export default router;

// import { createBrowserRouter, Navigate } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import DashboardLayout from "./layout/DashboardLayout";
// import Inventory from "./pages/Inventory";
// import AddItems from "./pages/AddItems";
// import AddItemPage from "./components/AddItemPage";
// import MedicationPage from "./components/MedicationPage";
// import ConsumablePage from "./components/ConsumablePage";
// import GeneralPage from "./components/GeneralPage";
// import Login from "./components/Login";
// import AdjustStockPage from "./pages/AdjustStockPage";
// import LowStockPage from "./pages/LowStockPage";
// import ItemCategoryPage from "./pages/ItemCategoryPage";
// import ExpiredItems from "./pages/ExpiredItemPage";
// import SkinCarePage from "./pages/SkinCarePage";
// import MedicationFridgePage from "./pages/MedicationFridgePage";
// import AparatusPage from "./pages/AparatusPage";

// // Admin pages
// import AdminOverview from "./pages/admin/AdminOverview";
// import BranchManagement from "./pages/admin/BranchManagement";
// import BranchDetails from "./pages/BranchDetails";

// // Protected Route as a Component
// const ProtectedRoute = ({ children }) => {
//   const authToken = localStorage.getItem("token"); // match your auth storage
//   return authToken ? children : <Navigate to="/login" replace />;
// };

// // Admin Route wrapper (frontend guard)
// const AdminRoute = ({ children }) => {
//   // try role from stored user object first, fallback to role key
//   const storedUser = (() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   })();
//   const role = storedUser?.role || localStorage.getItem("role");
//   if (!localStorage.getItem("token") || role !== "Admin") {
//     return <Navigate to="/dashboard" replace />;
//   }
//   return children;
// };

// const router = createBrowserRouter([
//   { path: "/", element: <Navigate to="/dashboard" replace /> },
//   { path: "/login", element: <Login /> },
//   {
//     path: "/dashboard",
//     element: (
//       <ProtectedRoute>
//         <DashboardLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <Dashboard /> },
//       { path: "inventory", element: <Inventory /> },
//       { path: "add-item", element: <AddItems /> },
//       { path: "add_item", element: <AddItemPage /> },
//       { path: "adjust-stock", element: <AdjustStockPage /> },

//       // inventory sub-routes (relative)
//       { path: "inventory/medication", element: <MedicationPage /> },
//       { path: "inventory/consumables", element: <ConsumablePage /> },
//       { path: "inventory/general", element: <GeneralPage /> },
//       { path: "inventory/skincare", element: <SkinCarePage /> },
//       { path: "inventory/medication-fridge", element: <MedicationFridgePage /> },
//       { path: "inventory/aparatus", element: <AparatusPage /> },

//       // misc
//       { path: "low-stock", element: <LowStockPage /> },
//       { path: "categories", element: <ItemCategoryPage /> },
//       { path: "expired-products", element: <ExpiredItems /> },

//       // Admin (monitor branches) - requires admin role
//       { path: "admin", element: <AdminRoute><AdminOverview /></AdminRoute> },
//       { path: "admin/branches", element: <AdminRoute><BranchManagement /></AdminRoute> },
//       { path: "admin/branch/:branchId", element: <AdminRoute><BranchDetails /></AdminRoute> },
//     ],
//   },
//   { path: "*", element: <Navigate to="/dashboard" replace /> },
// ]);

// export default router;



// import { createBrowserRouter, Navigate } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import DashboardLayout from "./layout/DashboardLayout";
// import Inventory from "./pages/Inventory";
// import AddItems from "./pages/AddItems";
// import AddItemPage from "./components/AddItemPage";
// import MedicationPage from "./components/MedicationPage";
// import ConsumablePage from "./components/ConsumablePage";
// import GeneralPage from "./components/GeneralPage";
// import Login from "./components/Login";
// import AdjustStockPage from "./pages/AdjustStockPage";
// import LowStockPage from "./pages/LowStockPage";
// import ItemCategoryPage from "./pages/ItemCategoryPage";
// import ExpiredItems from "./pages/ExpiredItemPage";
// import SkinCarePage from "./pages/SkinCarePage";
// import MedicationFridgePage from "./pages/MedicationFridgePage";
// import AparatusPage from "./pages/AparatusPage";
// import CreateBranch from "./pages/CreateBranch";

// // Admin Pages
// import AdminDashboard from "./pages/Admin/AdminDashboard";
// import BranchList from "./pages/Admin/BranchList";
// import BranchDetails from "./pages/Admin/BranchDetails";
// import AdminNotifications from "./pages/Admin/AdminNotifications";
// import UserManagement from "./pages/Admin/UserManagement";

// // Admin Inventory Pages - Use aliases to avoid conflicts
// import AdminMedicationsPage from "./pages/Admin/Inventory/MedicationsPage";
// import AdminConsumablesPage from "./pages/Admin/Inventory/ConsumablesPage";
// import AdminGeneralPage from "./pages/Admin/Inventory/GeneralPage";
// import AdminApparatusPage from "./pages/Admin/Inventory/ApparatusPage";
// import AdminSkinCarePage from "./pages/Admin/Inventory/SkinCarePage";
// import AdminMedicationFridgePage from "./pages/Admin/Inventory/MedicationFridgePage";

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const authToken = localStorage.getItem("token");
//   if (!authToken) {
//     console.log("ProtectedRoute: No token found, redirecting to login");
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

// // Admin Only Route Component
// const AdminRoute = ({ children }) => {
//   const authToken = localStorage.getItem("token");
//   const userStr = localStorage.getItem("user");
  
//   console.log("=== AdminRoute Check ===");
//   console.log("Token exists:", !!authToken);
  
//   if (!authToken) {
//     console.log("No token, redirecting to login");
//     return <Navigate to="/login" replace />;
//   }
  
//   try {
//     const user = JSON.parse(userStr);
//     console.log("User data:", user);
//     console.log("User role:", user?.role);
//     console.log("User branchId:", user?.branchId);
    
//     const isAdmin = user?.role === "Admin";
    
//     console.log("Is Admin:", isAdmin);
//     console.log("======================");
    
//     if (!isAdmin) {
//       console.log("Not an admin, redirecting to regular dashboard");
//       return <Navigate to="/dashboard" replace />;
//     }
    
//     console.log("Admin verified, rendering admin route");
//     return children;
//   } catch (error) {
//     console.error("Error parsing user data:", error);
//     console.log("Failed to parse user, redirecting to login");
//     return <Navigate to="/login" replace />;
//   }
// };

// const router = createBrowserRouter([
//   { path: "/", element: <Navigate to="/dashboard" replace /> },
//   { path: "/login", element: <Login /> },
//   {
//     path: "/dashboard",
//     element: (
//       <ProtectedRoute>
//         <DashboardLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       // Main dashboard - will auto-redirect admins
//       { index: true, element: <Dashboard /> },
      
//       // Regular routes
//       { path: "inventory", element: <Inventory /> },
//       { path: "add-item", element: <AddItems /> },
//       { path: "add_item", element: <AddItemPage /> },
//       { path: "adjust-stock", element: <AdjustStockPage /> },
//       { path: "inventory/medication", element: <MedicationPage /> },
//       { path: "inventory/consumables", element: <ConsumablePage /> },
//       { path: "inventory/general", element: <GeneralPage /> },
//       { path: "inventory/skincare", element: <SkinCarePage /> },
//       { path: "inventory/medication-fridge", element: <MedicationFridgePage /> },
//       { path: "inventory/aparatus", element: <AparatusPage /> },
//       { path: "low-stock", element: <LowStockPage /> },
//       { path: "categories", element: <ItemCategoryPage /> },
//       { path: "expired-products", element: <ExpiredItems /> },
//       { path: "create-branch", element: <CreateBranch /> },
      
//       // Admin Routes - Protected with AdminRoute
//       {
//         path: "admin",
//         element: (
//           <AdminRoute>
//             <AdminDashboard />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/branches",
//         element: (
//           <AdminRoute>
//             <BranchList />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/branch/:branchId",
//         element: (
//           <AdminRoute>
//             <BranchDetails />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/notifications",
//         element: (
//           <AdminRoute>
//             <AdminNotifications />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/users",
//         element: (
//           <AdminRoute>
//             <UserManagement />
//           </AdminRoute>
//         ),
//       },
      
//       // Admin Inventory Routes
//       {
//         path: "admin/inventory/medications",
//         element: (
//           <AdminRoute>
//             <AdminMedicationsPage />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/inventory/consumables",
//         element: (
//           <AdminRoute>
//             <AdminConsumablesPage />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/inventory/general",
//         element: (
//           <AdminRoute>
//             <AdminGeneralPage />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/inventory/apparatus",
//         element: (
//           <AdminRoute>
//             <AdminApparatusPage />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/inventory/skincare",
//         element: (
//           <AdminRoute>
//             <AdminSkinCarePage />
//           </AdminRoute>
//         ),
//       },
//       {
//         path: "admin/inventory/fridge",
//         element: (
//           <AdminRoute>
//             <AdminMedicationFridgePage />
//           </AdminRoute>
//         ),
//       },
//     ],
//   },
//   { path: "*", element: <Navigate to="/dashboard" replace /> },
// ]);

// export default router;


import { createBrowserRouter, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layout/DashboardLayout";
import Inventory from "./pages/Inventory";
import AddItems from "./pages/AddItems";
import AddItemPage from "./components/AddItemPage";
import MedicationPage from "./components/MedicationPage";
import ConsumablePage from "./components/ConsumablePage";
import GeneralPage from "./components/GeneralPage";
import Login from "./components/Login";
import AdjustStockPage from "./pages/AdjustStockPage";
import LowStockPage from "./pages/LowStockPage";
import ItemCategoryPage from "./pages/ItemCategoryPage";
import ExpiredItems from "./pages/ExpiredItemPage";
import SkinCarePage from "./pages/SkinCarePage";
import MedicationFridgePage from "./pages/MedicationFridgePage";
import AparatusPage from "./pages/AparatusPage";
import CreateBranch from "./pages/CreateBranch";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import BranchList from "./pages/Admin/BranchList";
import BranchDetails from "./pages/Admin/BranchDetails";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import UserManagement from "./pages/Admin/UserManagement";

// Admin Inventory Pages
import AdminMedicationsPage from "./pages/Admin/Inventory/MedicationsPage";
import AdminConsumablesPage from "./pages/Admin/Inventory/ConsumablesPage";
import AdminGeneralPage from "./pages/Admin/Inventory/GeneralPage";
import AdminApparatusPage from "./pages/Admin/Inventory/ApparatusPage";
import AdminSkinCarePage from "./pages/Admin/Inventory/SkinCarePage";
import AdminMedicationFridgePage from "./pages/Admin/Inventory/MedicationFridgePage";

// ✅ NEW: Stock Movement Report Page
import StockMovementPage from "./pages/Admin/StockMovementPage";

// --------------------
// Protected Route
// --------------------
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// --------------------
// Admin Route
// --------------------
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const user = JSON.parse(userStr);
    if (user?.role !== "Admin") {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

// --------------------
// Router
// --------------------
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <Login /> },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },

      // Regular User Routes
      { path: "inventory", element: <Inventory /> },
      { path: "add-item", element: <AddItems /> },
      { path: "add_item", element: <AddItemPage /> },
      { path: "adjust-stock", element: <AdjustStockPage /> },
      { path: "inventory/medication", element: <MedicationPage /> },
      { path: "inventory/consumables", element: <ConsumablePage /> },
      { path: "inventory/general", element: <GeneralPage /> },
      { path: "inventory/skincare", element: <SkinCarePage /> },
      { path: "inventory/medication-fridge", element: <MedicationFridgePage /> },
      { path: "inventory/aparatus", element: <AparatusPage /> },
      { path: "low-stock", element: <LowStockPage /> },
      { path: "categories", element: <ItemCategoryPage /> },
      { path: "expired-products", element: <ExpiredItems /> },
      { path: "create-branch", element: <CreateBranch /> },

      // --------------------
      // Admin Routes
      // --------------------
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "admin/branches",
        element: (
          <AdminRoute>
            <BranchList />
          </AdminRoute>
        ),
      },
      {
        path: "admin/branch/:branchId",
        element: (
          <AdminRoute>
            <BranchDetails />
          </AdminRoute>
        ),
      },
      {
        path: "admin/notifications",
        element: (
          <AdminRoute>
            <AdminNotifications />
          </AdminRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        ),
      },

      // Admin Inventory
      {
        path: "admin/inventory/medications",
        element: <AdminRoute><AdminMedicationsPage /></AdminRoute>,
      },
      {
        path: "admin/inventory/consumables",
        element: <AdminRoute><AdminConsumablesPage /></AdminRoute>,
      },
      {
        path: "admin/inventory/general",
        element: <AdminRoute><AdminGeneralPage /></AdminRoute>,
      },
      {
        path: "admin/inventory/apparatus",
        element: <AdminRoute><AdminApparatusPage /></AdminRoute>,
      },
      {
        path: "admin/inventory/skincare",
        element: <AdminRoute><AdminSkinCarePage /></AdminRoute>,
      },
      {
        path: "admin/inventory/fridge",
        element: <AdminRoute><AdminMedicationFridgePage /></AdminRoute>,
      },

      // ✅ ADMIN REPORT (Stock Movements)
      {
        path: "admin/report",
        element: (
          <AdminRoute>
            <StockMovementPage />
          </AdminRoute>
        ),
      },
    ],
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);

export default router;
