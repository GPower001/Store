// import React, { useContext, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Home,
//   Box,
//   Plus,
//   BarChart,
//   Settings,
//   LogOut,
//   Search,
//   Menu,
//   ChevronLeft,
//   ChevronDown,
//   ChevronRight,
//   Pill,
//   Syringe,
//   ShoppingBasket,
//   Minus,
//   Thermometer,
//   HeartPulse,
//   Droplet,
//   Building2, // 🏢 Icon for Branch
// } from "lucide-react";
// import { UserContext } from "../context/UserContext";
// import "bootstrap/dist/css/bootstrap.min.css";

// const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isInventoryOpen, setIsInventoryOpen] = useState(false);
//   const { logout, user } = useContext(UserContext); // ✅ get user from context

//   const isActive = (path) => location.pathname === path;

//   const toggleInventory = () => {
//     setIsInventoryOpen(!isInventoryOpen);
//   };

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // Fixed width values
//   const sidebarWidth = isCollapsed ? "64px" : "256px";

//   // Tailwind teal-600 color
//   const teal600 = "#0d9488";

//   return (
//     <div
//       className="d-flex flex-column bg-light shadow-sm border-end vh-100 position-relative"
//       style={{
//         width: sidebarWidth,
//         minWidth: sidebarWidth,
//         maxWidth: sidebarWidth,
//         flexShrink: "0",
//         flexGrow: "0",
//       }}
//     >
//       {/* Sidebar Header */}
//       <div
//         className="d-flex align-items-center justify-content-between p-3 text-white"
//         style={{ backgroundColor: teal600 }}
//       >
//         {!isCollapsed && <h5 className="m-0">Dashboard</h5>}
//         <button
//           className="btn btn-sm btn-light"
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           type="button"
//         >
//           {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* Search Bar */}
//       {!isCollapsed && (
//         <div className="p-2">
//           <div className="input-group">
//             <span className="input-group-text">
//               <Search size={16} />
//             </span>
//             <input type="text" className="form-control" placeholder="Search" />
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="flex-grow-1 overflow-hidden">
//         <ul className="list-unstyled p-2">
//           {/* Dashboard */}
//           <li className="mb-2">
//             <Link
//               to="/dashboard"
//               className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                 isActive("/dashboard") ? "text-white" : "text-dark"
//               } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//               style={isActive("/dashboard") ? { backgroundColor: teal600 } : {}}
//             >
//               <Home size={18} />
//               {!isCollapsed && <span>Dashboard</span>}
//             </Link>
//           </li>

//           {/* Inventory - Collapsible Section */}
//           <li className="mb-2">
//             <button
//               onClick={toggleInventory}
//               className={`btn d-flex align-items-center p-2 w-100 text-decoration-none rounded border-0 ${
//                 isActive("/dashboard/inventory") ||
//                 isActive("/dashboard/inventory/medication") ||
//                 isActive("/dashboard/inventory/consumables") ||
//                 isActive("/dashboard/inventory/general") ||
//                 isActive("/dashboard/inventory/aparatus") ||
//                 isActive("/dashboard/inventory/skincare") ||
//                 isActive("/dashboard/inventory/medication-fridge")
//                   ? "text-white"
//                   : "text-dark bg-transparent"
//               } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//               style={
//                 isActive("/dashboard/inventory") ||
//                 isActive("/dashboard/inventory/medication") ||
//                 isActive("/dashboard/inventory/consumables") ||
//                 isActive("/dashboard/inventory/general") ||
//                 isActive("/dashboard/inventory/aparatus") ||
//                 isActive("/dashboard/inventory/skincare") ||
//                 isActive("/dashboard/inventory/medication-fridge")
//                   ? { backgroundColor: teal600 }
//                   : {}
//               }
//             >
//               <Box size={18} />
//               {!isCollapsed && (
//                 <>
//                   <span className="flex-grow-1 text-start">Inventory</span>
//                   {isInventoryOpen ? (
//                     <ChevronDown size={16} />
//                   ) : (
//                     <ChevronRight size={16} />
//                   )}
//                 </>
//               )}
//             </button>

//             {/* Inventory Sub-items */}
//             {!isCollapsed && isInventoryOpen && (
//               <ul className="list-unstyled ps-4 mt-2">
//                 <li className="mb-1">
//                   <Link
//                     to="/dashboard/inventory/medication"
//                     className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                       isActive("/dashboard/inventory/medication")
//                         ? "text-white"
//                         : "text-dark"
//                     } gap-2`}
//                     style={
//                       isActive("/dashboard/inventory/medication")
//                         ? { backgroundColor: teal600 }
//                         : {}
//                     }
//                   >
//                     <Pill size={16} />
//                     <span>Medication</span>
//                   </Link>
//                 </li>
//                 <li className="mb-1">
//                   <Link
//                     to="/dashboard/inventory/consumables"
//                     className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                       isActive("/dashboard/inventory/consumables")
//                         ? "text-white"
//                         : "text-dark"
//                     } gap-2`}
//                     style={
//                       isActive("/dashboard/inventory/consumables")
//                         ? { backgroundColor: teal600 }
//                         : {}
//                     }
//                   >
//                     <Syringe size={16} />
//                     <span>Consumables</span>
//                   </Link>
//                 </li>
//                 <li className="mb-1">
//                   <Link
//                     to="/dashboard/inventory/general"
//                     className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                       isActive("/dashboard/inventory/general")
//                         ? "text-white"
//                         : "text-dark"
//                     } gap-2`}
//                     style={
//                       isActive("/dashboard/inventory/general")
//                         ? { backgroundColor: teal600 }
//                         : {}
//                     }
//                   >
//                     <ShoppingBasket size={16} />
//                     <span>General</span>
//                   </Link>
//                 </li>
//                 <li className="mb-1">
//                   <Link
//                     to="/dashboard/inventory/aparatus"
//                     className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                       isActive("/dashboard/inventory/aparatus")
//                         ? "text-white"
//                         : "text-dark"
//                     } gap-2`}
//                     style={
//                       isActive("/dashboard/inventory/aparatus")
//                         ? { backgroundColor: teal600 }
//                         : {}
//                     }
//                   >
//                     <HeartPulse size={16} />
//                     <span>Apparatus</span>
//                   </Link>
//                 </li>
//                 <li className="mb-1">
//                   <Link
//                     to="/dashboard/inventory/skincare"
//                     className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                       isActive("/dashboard/inventory/skincare")
//                         ? "text-white"
//                         : "text-dark"
//                     } gap-2`}
//                     style={
//                       isActive("/dashboard/inventory/skincare")
//                         ? { backgroundColor: teal600 }
//                         : {}
//                     }
//                   >
//                     <Droplet size={16} />
//                     <span>Skin Care Products</span>
//                   </Link>
//                 </li>
//                 <li className="mb-1">
//                   <Link
//                     to="/dashboard/inventory/medication-fridge"
//                     className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                       isActive("/dashboard/inventory/medication-fridge")
//                         ? "text-white"
//                         : "text-dark"
//                     } gap-2`}
//                     style={
//                       isActive("/dashboard/inventory/medication-fridge")
//                         ? { backgroundColor: teal600 }
//                         : {}
//                     }
//                   >
//                     <Thermometer size={16} />
//                     <span>Medication (Fridge)</span>
//                   </Link>
//                 </li>
//               </ul>
//             )}
//           </li>

//           {/* Other Menu Items */}
//           {[
//             {
//               name: "Add Item",
//               icon: <Plus size={18} />,
//               path: "/dashboard/add-item",
//             },
//             {
//               name: "Adjust Stock",
//               icon: <Minus size={18} />,
//               path: "/dashboard/adjust-stock",
//             },
//             {
//               name: "Report",
//               icon: <BarChart size={18} />,
//               path: "/dashboard/report",
//             },
//           ].map((item, index) => (
//             <li key={index} className="mb-2">
//               <Link
//                 to={item.path}
//                 className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                   isActive(item.path) ? "text-white" : "text-dark"
//                 } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//                 style={
//                   isActive(item.path) ? { backgroundColor: teal600 } : {}
//                 }
//               >
//                 {item.icon}
//                 {!isCollapsed && <span>{item.name}</span>}
//               </Link>
//             </li>
//           ))}

//           {/* ✅ Admin-only: Create Branch */}
//           {user?.role === "Admin" && (
//             <li className="mb-2">
//               <Link
//                 to="/dashboard/create-branch"
//                 className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                   isActive("/dashboard/create-branch")
//                     ? "text-white"
//                     : "text-dark"
//                 } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//                 style={
//                   isActive("/dashboard/create-branch")
//                     ? { backgroundColor: teal600 }
//                     : {}
//                 }
//               >
//                 <Building2 size={18} />
//                 {!isCollapsed && <span>Create Branch</span>}
//               </Link>
//             </li>
//           )}
//         </ul>
//       </nav>

//       {/* Divider */}
//       <div className="border-top my-2"></div>

//       {/* Settings & Logout */}
//       <ul className="list-unstyled p-2">
//         <li className="mb-2">
//           <Link
//             to="/dashboard/settings"
//             className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//               isActive("/dashboard/settings") ? "text-white" : "text-dark"
//             } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//             style={
//               isActive("/dashboard/settings") ? { backgroundColor: teal600 } : {}
//             }
//           >
//             <Settings size={18} />
//             {!isCollapsed && <span>Settings</span>}
//           </Link>
//         </li>

//         <li>
//           <button
//             onClick={handleLogout}
//             className={`btn btn-danger w-100 d-flex align-items-center justify-content-center ${
//               !isCollapsed ? "gap-2" : ""
//             }`}
//           >
//             <LogOut size={18} />
//             {!isCollapsed && <span>Logout</span>}
//           </button>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;


// import React, { useContext, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Home,
//   Box,
//   Plus,
//   BarChart,
//   Settings,
//   LogOut,
//   Search,
//   Menu,
//   ChevronLeft,
//   ChevronDown,
//   ChevronRight,
//   Pill,
//   Syringe,
//   ShoppingBasket,
//   Minus,
//   Thermometer,
//   HeartPulse,
//   Droplet,
//   Building2,
//   Users,
//   Bell,
//   TrendingUp,
//   Package,
//   Sparkles,
//   Wrench,
//   Refrigerator,
// } from "lucide-react";
// import { UserContext } from "../context/UserContext";
// import "bootstrap/dist/css/bootstrap.min.css";

// const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [isInventoryOpen, setIsInventoryOpen] = useState(false);
//   const [isAdminOpen, setIsAdminOpen] = useState(false);
//   const [isAdminInventoryOpen, setIsAdminInventoryOpen] = useState(false);
//   const { logout, user } = useContext(UserContext);

//   const isActive = (path) => location.pathname === path;

//   const toggleInventory = () => {
//     setIsInventoryOpen(!isInventoryOpen);
//   };

//   const toggleAdmin = () => {
//     setIsAdminOpen(!isAdminOpen);
//   };

//   const toggleAdminInventory = () => {
//     setIsAdminInventoryOpen(!isAdminInventoryOpen);
//   };

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   // Fixed width values
//   const sidebarWidth = isCollapsed ? "64px" : "256px";

//   // Tailwind teal-600 color
//   const teal600 = "#0d9488";

//   // ✅ Determine correct dashboard path based on user role
//   const dashboardPath = user?.role === "Admin" ? "/dashboard/admin" : "/dashboard";

//   // ✅ Check if any admin route is active
//   const isAdminRouteActive = () => {
//     return location.pathname.startsWith("/dashboard/admin");
//   };

//   // ✅ Check if any admin inventory route is active
//   const isAdminInventoryActive = () => {
//     return location.pathname.startsWith("/dashboard/admin/inventory");
//   };

//   return (
//     <div
//       className="d-flex flex-column bg-light shadow-sm border-end vh-100 position-relative"
//       style={{
//         width: sidebarWidth,
//         minWidth: sidebarWidth,
//         maxWidth: sidebarWidth,
//         flexShrink: "0",
//         flexGrow: "0",
//       }}
//     >
//       {/* Sidebar Header */}
//       <div
//         className="d-flex align-items-center justify-content-between p-3 text-white"
//         style={{ backgroundColor: teal600 }}
//       >
//         {!isCollapsed && <h5 className="m-0">Dashboard</h5>}
//         <button
//           className="btn btn-sm btn-light"
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           type="button"
//         >
//           {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* Search Bar */}
//       {!isCollapsed && (
//         <div className="p-2">
//           <div className="input-group">
//             <span className="input-group-text">
//               <Search size={16} />
//             </span>
//             <input type="text" className="form-control" placeholder="Search" />
//           </div>
//         </div>
//       )}

//       {/* User Info Badge (if not collapsed) */}
//       {!isCollapsed && user && (
//         <div className="px-3 py-2 mx-2 mb-2 bg-white border rounded">
//           <div className="d-flex align-items-center gap-2">
//             <div className="bg-teal-100 rounded-circle d-flex align-items-center justify-content-center"
//                  style={{ width: "32px", height: "32px" }}>
//               <span className="fw-bold text-teal-600" style={{ color: teal600 }}>
//                 {user.name?.charAt(0).toUpperCase()}
//               </span>
//             </div>
//             <div className="flex-grow-1" style={{ minWidth: 0 }}>
//               <div className="fw-semibold text-truncate small">{user.name}</div>
//               <div className="text-muted" style={{ fontSize: "0.75rem" }}>
//                 <span className={`badge ${user.role === "Admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
//                       style={{
//                         backgroundColor: user.role === "Admin" ? "#f3e8ff" : "#dbeafe",
//                         color: user.role === "Admin" ? "#7c3aed" : "#1e40af",
//                       }}>
//                   {user.role}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="flex-grow-1 overflow-auto">
//         <ul className="list-unstyled p-2">
//           {/* Dashboard - Smart routing based on role */}
//           <li className="mb-2">
//             <Link
//               to={dashboardPath}
//               className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                 isActive(dashboardPath) ? "text-white" : "text-dark"
//               } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//               style={isActive(dashboardPath) ? { backgroundColor: teal600 } : {}}
//             >
//               <Home size={18} />
//               {!isCollapsed && <span>Dashboard</span>}
//             </Link>
//           </li>

//           {/* ===== ADMIN SECTION ===== */}
//           {user?.role === "Admin" && (
//             <>
//               {/* Divider */}
//               {!isCollapsed && (
//                 <li className="mb-2">
//                   <div className="px-2 py-1">
//                     <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.7rem" }}>
//                       Admin Panel
//                     </small>
//                   </div>
//                 </li>
//               )}

//               {/* Admin Dashboard with Submenu */}
//               <li className="mb-2">
//                 <button
//                   onClick={toggleAdmin}
//                   className={`btn d-flex align-items-center p-2 w-100 text-decoration-none rounded border-0 ${
//                     isAdminRouteActive() && !isAdminInventoryActive() ? "text-white" : "text-dark bg-transparent"
//                   } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//                   style={isAdminRouteActive() && !isAdminInventoryActive() ? { backgroundColor: teal600 } : {}}
//                 >
//                   <TrendingUp size={18} />
//                   {!isCollapsed && (
//                     <>
//                       <span className="flex-grow-1 text-start">Admin Tools</span>
//                       {isAdminOpen ? (
//                         <ChevronDown size={16} />
//                       ) : (
//                         <ChevronRight size={16} />
//                       )}
//                     </>
//                   )}
//                 </button>

//                 {/* Admin Sub-items */}
//                 {!isCollapsed && isAdminOpen && (
//                   <ul className="list-unstyled ps-4 mt-2">
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/branches"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/branches")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/branches")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Building2 size={16} />
//                         <span>Manage Branches</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/users"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/users")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/users")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Users size={16} />
//                         <span>User Management</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/notifications"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/notifications")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/notifications")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Bell size={16} />
//                         <span>Notifications</span>
//                       </Link>
//                     </li>
//                   </ul>
//                 )}
//               </li>

//               {/* Admin Inventory Section */}
//               <li className="mb-2">
//                 <button
//                   onClick={toggleAdminInventory}
//                   className={`btn d-flex align-items-center p-2 w-100 text-decoration-none rounded border-0 ${
//                     isAdminInventoryActive() ? "text-white" : "text-dark bg-transparent"
//                   } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//                   style={isAdminInventoryActive() ? { backgroundColor: teal600 } : {}}
//                 >
//                   <Package size={18} />
//                   {!isCollapsed && (
//                     <>
//                       <span className="flex-grow-1 text-start">Admin Inventory</span>
//                       {isAdminInventoryOpen ? (
//                         <ChevronDown size={16} />
//                       ) : (
//                         <ChevronRight size={16} />
//                       )}
//                     </>
//                   )}
//                 </button>

//                 {/* Admin Inventory Sub-items */}
//                 {!isCollapsed && isAdminInventoryOpen && (
//                   <ul className="list-unstyled ps-4 mt-2">
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/inventory/medications"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/inventory/medications")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/inventory/medications")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Pill size={16} />
//                         <span>Medications</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/inventory/consumables"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/inventory/consumables")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/inventory/consumables")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Syringe size={16} />
//                         <span>Consumables</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/inventory/general"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/inventory/general")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/inventory/general")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <ShoppingBasket size={16} />
//                         <span>General</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/inventory/apparatus"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/inventory/apparatus")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/inventory/apparatus")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Wrench size={16} />
//                         <span>Apparatus</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/inventory/skincare"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/inventory/skincare")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/inventory/skincare")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Sparkles size={16} />
//                         <span>Skin Care</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/admin/inventory/fridge"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/admin/inventory/fridge")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/admin/inventory/fridge")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Refrigerator size={16} />
//                         <span>Stem Cell</span>
//                       </Link>
//                     </li>
//                   </ul>
//                 )}
//               </li>

//               {/* Create Branch - Standalone */}
//               <li className="mb-2">
//                 <Link
//                   to="/dashboard/create-branch"
//                   className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                     isActive("/dashboard/create-branch")
//                       ? "text-white"
//                       : "text-dark"
//                   } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//                   style={
//                     isActive("/dashboard/create-branch")
//                       ? { backgroundColor: teal600 }
//                       : {}
//                   }
//                 >
//                   <Building2 size={18} />
//                   {!isCollapsed && <span>Create Branch</span>}
//                 </Link>
//               </li>
//             </>
//           )}

//           {/* ===== REGULAR USER SECTION ===== */}
//           {/* Only show regular inventory for non-admin users */}
//           {user?.role !== "Admin" && (
//             <>
//               {/* Inventory - Collapsible Section */}
//               <li className="mb-2">
//                 <button
//                   onClick={toggleInventory}
//                   className={`btn d-flex align-items-center p-2 w-100 text-decoration-none rounded border-0 ${
//                     isActive("/dashboard/inventory") ||
//                     isActive("/dashboard/inventory/medication") ||
//                     isActive("/dashboard/inventory/consumables") ||
//                     isActive("/dashboard/inventory/general") ||
//                     isActive("/dashboard/inventory/aparatus") ||
//                     isActive("/dashboard/inventory/skincare") ||
//                     isActive("/dashboard/inventory/medication-fridge")
//                       ? "text-white"
//                       : "text-dark bg-transparent"
//                   } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//                   style={
//                     isActive("/dashboard/inventory") ||
//                     isActive("/dashboard/inventory/medication") ||
//                     isActive("/dashboard/inventory/consumables") ||
//                     isActive("/dashboard/inventory/general") ||
//                     isActive("/dashboard/inventory/aparatus") ||
//                     isActive("/dashboard/inventory/skincare") ||
//                     isActive("/dashboard/inventory/medication-fridge")
//                       ? { backgroundColor: teal600 }
//                       : {}
//                   }
//                 >
//                   <Box size={18} />
//                   {!isCollapsed && (
//                     <>
//                       <span className="flex-grow-1 text-start">Inventory</span>
//                       {isInventoryOpen ? (
//                         <ChevronDown size={16} />
//                       ) : (
//                         <ChevronRight size={16} />
//                       )}
//                     </>
//                   )}
//                 </button>

//                 {/* Inventory Sub-items */}
//                 {!isCollapsed && isInventoryOpen && (
//                   <ul className="list-unstyled ps-4 mt-2">
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/inventory/medication"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/inventory/medication")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/inventory/medication")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Pill size={16} />
//                         <span>Medication</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/inventory/consumables"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/inventory/consumables")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/inventory/consumables")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Syringe size={16} />
//                         <span>Consumables</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/inventory/general"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/inventory/general")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/inventory/general")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <ShoppingBasket size={16} />
//                         <span>General</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/inventory/aparatus"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/inventory/aparatus")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/inventory/aparatus")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <HeartPulse size={16} />
//                         <span>Apparatus</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/inventory/skincare"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/inventory/skincare")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/inventory/skincare")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Droplet size={16} />
//                         <span>Skin Care Products</span>
//                       </Link>
//                     </li>
//                     <li className="mb-1">
//                       <Link
//                         to="/dashboard/inventory/medication-fridge"
//                         className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                           isActive("/dashboard/inventory/medication-fridge")
//                             ? "text-white"
//                             : "text-dark"
//                         } gap-2`}
//                         style={
//                           isActive("/dashboard/inventory/medication-fridge")
//                             ? { backgroundColor: teal600 }
//                             : {}
//                         }
//                       >
//                         <Thermometer size={16} />
//                         <span>Stem Cell</span>
//                       </Link>
//                     </li>
//                   </ul>
//                 )}
//               </li>
//             </>
//           )}

//           {/* Other Menu Items */}
//           {[
//             {
//               name: "Add Item",
//               icon: <Plus size={18} />,
//               path: "/dashboard/add-item",
//             },
//             {
//               name: "Adjust Stock",
//               icon: <Minus size={18} />,
//               path: "/dashboard/adjust-stock",
//             },
//             {
//               name: "Report",
//               icon: <BarChart size={18} />,
//               path: "/dashboard/report",
//             },
//           ].map((item, index) => (
//             <li key={index} className="mb-2">
//               <Link
//                 to={item.path}
//                 className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//                   isActive(item.path) ? "text-white" : "text-dark"
//                 } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//                 style={
//                   isActive(item.path) ? { backgroundColor: teal600 } : {}
//                 }
//               >
//                 {item.icon}
//                 {!isCollapsed && <span>{item.name}</span>}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Divider */}
//       <div className="border-top my-2"></div>

//       {/* Settings & Logout */}
//       <ul className="list-unstyled p-2">
//         <li className="mb-2">
//           <Link
//             to="/dashboard/settings"
//             className={`d-flex align-items-center p-2 text-decoration-none rounded ${
//               isActive("/dashboard/settings") ? "text-white" : "text-dark"
//             } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
//             style={
//               isActive("/dashboard/settings") ? { backgroundColor: teal600 } : {}
//             }
//           >
//             <Settings size={18} />
//             {!isCollapsed && <span>Settings</span>}
//           </Link>
//         </li>

//         <li>
//           <button
//             onClick={handleLogout}
//             className={`btn btn-danger w-100 d-flex align-items-center justify-content-center ${
//               !isCollapsed ? "gap-2" : ""
//             }`}
//           >
//             <LogOut size={18} />
//             {!isCollapsed && <span>Logout</span>}
//           </button>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;


import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Box,
  Plus,
  BarChart,
  Settings,
  LogOut,
  Search,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Pill,
  Syringe,
  ShoppingBasket,
  Minus,
  Thermometer,
  HeartPulse,
  Droplet,
  Building2,
  Users,
  Bell,
  TrendingUp,
  Package,
  Sparkles,
  Wrench,
  Refrigerator,
} from "lucide-react";
import { UserContext } from "../context/UserContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminInventoryOpen, setIsAdminInventoryOpen] = useState(false);
  const { logout, user } = useContext(UserContext);

  const isActive = (path) => location.pathname === path;

  const toggleInventory = () => {
    setIsInventoryOpen(!isInventoryOpen);
  };

  const toggleAdmin = () => {
    setIsAdminOpen(!isAdminOpen);
  };

  const toggleAdminInventory = () => {
    setIsAdminInventoryOpen(!isAdminInventoryOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fixed width values
  const sidebarWidth = isCollapsed ? "64px" : "256px";

  // Tailwind teal-600 color
  const teal600 = "#0d9488";

  // ✅ Determine correct dashboard path based on user role
  const dashboardPath = user?.role === "Admin" ? "/dashboard/admin" : "/dashboard";

  // ✅ Check if any admin route is active
  const isAdminRouteActive = () => {
    return location.pathname.startsWith("/dashboard/admin");
  };

  // ✅ Check if any admin inventory route is active
  const isAdminInventoryActive = () => {
    return location.pathname.startsWith("/dashboard/admin/inventory");
  };

  // ONLY LOGIC CHANGE — correct path for Report based on role
  const reportPath = user?.role === "Admin" ? "/dashboard/admin/report" : "/dashboard/report";

  return (
    <div
      className="d-flex flex-column bg-light shadow-sm border-end vh-100 position-relative"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        flexShrink: "0",
        flexGrow: "0",
      }}
    >
      {/* Sidebar Header */}
      <div
        className="d-flex align-items-center justify-content-between p-3 text-white"
        style={{ backgroundColor: teal600 }}
      >
        {!isCollapsed && <h5 className="m-0">Dashboard</h5>}
        <button
          className="btn btn-sm btn-light"
          onClick={() => setIsCollapsed(!isCollapsed)}
          type="button"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-2">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input type="text" className="form-control" placeholder="Search" />
          </div>
        </div>
      )}

      {/* User Info Badge (if not collapsed) */}
      {!isCollapsed && user && (
        <div className="px-3 py-2 mx-2 mb-2 bg-white border rounded">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-teal-100 rounded-circle d-flex align-items-center justify-content-center"
                 style={{ width: "32px", height: "32px" }}>
              <span className="fw-bold text-teal-600" style={{ color: teal600 }}>
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="fw-semibold text-truncate small">{user.name}</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                <span className={`badge ${user.role === "Admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                      style={{
                        backgroundColor: user.role === "Admin" ? "#f3e8ff" : "#dbeafe",
                        color: user.role === "Admin" ? "#7c3aed" : "#1e40af",
                      }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-grow-1 overflow-auto">
        <ul className="list-unstyled p-2">
          {/* Dashboard - Smart routing based on role */}
          <li className="mb-2">
            <Link
              to={dashboardPath}
              className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                isActive(dashboardPath) ? "text-white" : "text-dark"
              } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
              style={isActive(dashboardPath) ? { backgroundColor: teal600 } : {}}
            >
              <Home size={18} />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>

          {/* ===== ADMIN SECTION ===== */}
          {user?.role === "Admin" && (
            <>
              {/* Divider */}
              {!isCollapsed && (
                <li className="mb-2">
                  <div className="px-2 py-1">
                    <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: "0.7rem" }}>
                      Admin Panel
                    </small>
                  </div>
                </li>
              )}

              {/* Admin Dashboard with Submenu */}
              <li className="mb-2">
                <button
                  onClick={toggleAdmin}
                  className={`btn d-flex align-items-center p-2 w-100 text-decoration-none rounded border-0 ${
                    isAdminRouteActive() && !isAdminInventoryActive() ? "text-white" : "text-dark bg-transparent"
                  } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
                  style={isAdminRouteActive() && !isAdminInventoryActive() ? { backgroundColor: teal600 } : {}}
                >
                  <TrendingUp size={18} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-grow-1 text-start">Admin Tools</span>
                      {isAdminOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </button>

                {/* Admin Sub-items */}
                {!isCollapsed && isAdminOpen && (
                  <ul className="list-unstyled ps-4 mt-2">
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/branches"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/branches")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/branches")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Building2 size={16} />
                        <span>Manage Branches</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/users"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/users")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/users")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Users size={16} />
                        <span>User Management</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/notifications"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/notifications")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/notifications")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Bell size={16} />
                        <span>Notifications</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Admin Inventory Section */}
              <li className="mb-2">
                <button
                  onClick={toggleAdminInventory}
                  className={`btn d-flex align-items-center p-2 w-100 text-decoration-none rounded border-0 ${
                    isAdminInventoryActive() ? "text-white" : "text-dark bg-transparent"
                  } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
                  style={isAdminInventoryActive() ? { backgroundColor: teal600 } : {}}
                >
                  <Package size={18} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-grow-1 text-start">Admin Inventory</span>
                      {isAdminInventoryOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </button>

                {/* Admin Inventory Sub-items */}
                {!isCollapsed && isAdminInventoryOpen && (
                  <ul className="list-unstyled ps-4 mt-2">
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/inventory/medications"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/inventory/medications")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/inventory/medications")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Pill size={16} />
                        <span>Medications</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/inventory/consumables"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/inventory/consumables")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/inventory/consumables")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Syringe size={16} />
                        <span>Consumables</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/inventory/general"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/inventory/general")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/inventory/general")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <ShoppingBasket size={16} />
                        <span>General</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/inventory/apparatus"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/inventory/apparatus")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/inventory/apparatus")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Wrench size={16} />
                        <span>Apparatus</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/inventory/skincare"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/inventory/skincare")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/inventory/skincare")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Sparkles size={16} />
                        <span>Skin Care</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/admin/inventory/fridge"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/admin/inventory/fridge")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/admin/inventory/fridge")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Refrigerator size={16} />
                        <span>Stem Cell</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Create Branch - Standalone */}
              <li className="mb-2">
                <Link
                  to="/dashboard/create-branch"
                  className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                    isActive("/dashboard/create-branch")
                      ? "text-white"
                      : "text-dark"
                  } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
                  style={
                    isActive("/dashboard/create-branch")
                      ? { backgroundColor: teal600 }
                      : {}
                  }
                >
                  <Building2 size={18} />
                  {!isCollapsed && <span>Create Branch</span>}
                </Link>
              </li>

              {/* ✅ ADMIN REPORT - Only this should show for admin, not Add Item or Adjust Stock */}
              <li className="mb-2">
                <Link
                  to={reportPath}
                  className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                    isActive(reportPath) ? "text-white" : "text-dark"
                  } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
                  style={isActive(reportPath) ? { backgroundColor: teal600 } : {}}
                >
                  <BarChart size={18} />
                  {!isCollapsed && <span>Report</span>}
                </Link>
              </li>
            </>
          )}

          {/* ===== REGULAR USER SECTION ===== */}
          {/* Only show regular inventory for non-admin users */}
          {user?.role !== "Admin" && (
            <>
              {/* Inventory - Collapsible Section */}
              <li className="mb-2">
                <button
                  onClick={toggleInventory}
                  className={`btn d-flex align-items-center p-2 w-100 text-decoration-none rounded border-0 ${
                    isActive("/dashboard/inventory") ||
                    isActive("/dashboard/inventory/medication") ||
                    isActive("/dashboard/inventory/consumables") ||
                    isActive("/dashboard/inventory/general") ||
                    isActive("/dashboard/inventory/aparatus") ||
                    isActive("/dashboard/inventory/skincare") ||
                    isActive("/dashboard/inventory/medication-fridge")
                      ? "text-white"
                      : "text-dark bg-transparent"
                  } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
                  style={
                    isActive("/dashboard/inventory") ||
                    isActive("/dashboard/inventory/medication") ||
                    isActive("/dashboard/inventory/consumables") ||
                    isActive("/dashboard/inventory/general") ||
                    isActive("/dashboard/inventory/aparatus") ||
                    isActive("/dashboard/inventory/skincare") ||
                    isActive("/dashboard/inventory/medication-fridge")
                      ? { backgroundColor: teal600 }
                      : {}
                  }
                >
                  <Box size={18} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-grow-1 text-start">Inventory</span>
                      {isInventoryOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </button>

                {/* Inventory Sub-items */}
                {!isCollapsed && isInventoryOpen && (
                  <ul className="list-unstyled ps-4 mt-2">
                    <li className="mb-1">
                      <Link
                        to="/dashboard/inventory/medication"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/inventory/medication")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/inventory/medication")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Pill size={16} />
                        <span>Medication</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/inventory/consumables"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/inventory/consumables")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/inventory/consumables")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Syringe size={16} />
                        <span>Consumables</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/inventory/general"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/inventory/general")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/inventory/general")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <ShoppingBasket size={16} />
                        <span>General</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/inventory/aparatus"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/inventory/aparatus")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/inventory/aparatus")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Wrench size={16} />
                        <span>Apparatus</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/inventory/skincare"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/inventory/skincare")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/inventory/skincare")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Sparkles size={16} />
                        <span>Skin Care</span>
                      </Link>
                    </li>
                    <li className="mb-1">
                      <Link
                        to="/dashboard/inventory/medication-fridge"
                        className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                          isActive("/dashboard/inventory/medication-fridge")
                            ? "text-white"
                            : "text-dark"
                        } gap-2`}
                        style={
                          isActive("/dashboard/inventory/medication-fridge")
                            ? { backgroundColor: teal600 }
                            : {}
                        }
                      >
                        <Refrigerator size={16} />
                        <span>Stem Cell</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* ✅ Add Item and Adjust Stock - Only for regular users */}
              {[
                {
                  name: "Add Item",
                  icon: <Plus size={18} />,
                  path: "/dashboard/add-item",
                },
                {
                  name: "Adjust Stock",
                  icon: <Minus size={18} />,
                  path: "/dashboard/adjust-stock",
                },
                {
                  name: "Report",
                  icon: <BarChart size={18} />,
                  path: reportPath,
                },
              ].map((item, index) => (
                <li key={index} className="mb-2">
                  <Link
                    to={item.path}
                    className={`d-flex align-items-center p-2 text-decoration-none rounded ${
                      isActive(item.path) ? "text-white" : "text-dark"
                    } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
                    style={isActive(item.path) ? { backgroundColor: teal600 } : {}}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>

      <div className="border-top my-2" />

      {/* Settings and Logout */}
      <ul className="list-unstyled p-2">
        <li className="mb-2">
          <Link
            to="/dashboard/settings"
            className={`d-flex align-items-center p-2 text-decoration-none rounded ${
              isActive("/dashboard/settings") ? "text-white" : "text-dark"
            } ${isCollapsed ? "justify-content-center" : "gap-2"}`}
            style={isActive("/dashboard/settings") ? { backgroundColor: teal600 } : {}}
          >
            <Settings size={18} />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className={`btn btn-danger w-100 d-flex align-items-center justify-content-center ${
              !isCollapsed ? "gap-2" : ""
            }`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;