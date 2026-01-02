// import React, { useState, useEffect, useContext } from "react";
// import { UserContext } from "../context/UserContext"; // ✅ Changed from ../../context
// import {
//   Building2,
//   AlertTriangle,
//   TrendingDown,
//   TrendingUp,
// } from "lucide-react";
// import api from "../utils/api"; // ✅ Also fix this
// import "bootstrap/dist/css/bootstrap.min.css";

// const AdminOverview = () => {
//   const { user } = useContext(UserContext);
//   const [stats, setStats] = useState({
//     totalBranches: 0,
//     totalItems: 0,
//     lowStockItems: 0,
//     expiredItems: 0,
//     branches: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchAdminStats();
//   }, []);

//   const fetchAdminStats = async () => {
//     try {
//       const res = await api.get("/api/admin/overview");
//       setStats(res.data.data);
//       setLoading(false);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch stats");
//       setLoading(false);
//     }
//   };

//   if (!user || user.role !== "Admin") {
//     return (
//       <div className="alert alert-danger">
//         You do not have access to the admin section.
//       </div>
//     );
//   }

//   if (loading) return <div className="text-center mt-5">Loading...</div>;

//   return (
//     <div className="p-4">
//       <h2 className="mb-4">Admin Overview - All Branches</h2>

//       {error && <div className="alert alert-danger">{error}</div>}

//       {/* Overall Stats */}
//       <div className="row mb-4">
//         <div className="col-md-3">
//           <div className="card shadow-sm border-0">
//             <div className="card-body">
//               <div className="d-flex align-items-center gap-3">
//                 <Building2 size={32} className="text-primary" />
//                 <div>
//                   <h6 className="text-muted mb-0">Total Branches</h6>
//                   <h3 className="mb-0">{stats.totalBranches}</h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-3">
//           <div className="card shadow-sm border-0">
//             <div className="card-body">
//               <div className="d-flex align-items-center gap-3">
//                 <TrendingUp size={32} className="text-success" />
//                 <div>
//                   <h6 className="text-muted mb-0">Total Items</h6>
//                   <h3 className="mb-0">{stats.totalItems}</h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-3">
//           <div className="card shadow-sm border-0">
//             <div className="card-body">
//               <div className="d-flex align-items-center gap-3">
//                 <AlertTriangle size={32} className="text-warning" />
//                 <div>
//                   <h6 className="text-muted mb-0">Low Stock Items</h6>
//                   <h3 className="mb-0">{stats.lowStockItems}</h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-3">
//           <div className="card shadow-sm border-0">
//             <div className="card-body">
//               <div className="d-flex align-items-center gap-3">
//                 <TrendingDown size={32} className="text-danger" />
//                 <div>
//                   <h6 className="text-muted mb-0">Expired Items</h6>
//                   <h3 className="mb-0">{stats.expiredItems}</h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Branch Details */}
//       <div className="mt-5">
//         <h4 className="mb-3">Branch-wise Status</h4>
//         <div className="table-responsive">
//           <table className="table table-hover">
//             <thead className="table-dark">
//               <tr>
//                 <th>Branch Name</th>
//                 <th>Location</th>
//                 <th>Total Items</th>
//                 <th>Low Stock</th>
//                 <th>Expired</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {stats.branches.map((branch) => (
//                 <tr key={branch._id}>
//                   <td className="fw-bold">{branch.name}</td>
//                   <td>{branch.location}</td>
//                   <td>{branch.totalItems}</td>
//                   <td>
//                     <span className="badge bg-warning">
//                       {branch.lowStockItems}
//                     </span>
//                   </td>
//                   <td>
//                     <span className="badge bg-danger">
//                       {branch.expiredItems}
//                     </span>
//                   </td>
//                   <td>
//                     {branch.expiredItems > 0 ? (
//                       <span className="badge bg-danger">⚠️ Critical</span>
//                     ) : branch.lowStockItems > 5 ? (
//                       <span className="badge bg-warning">⚠️ Warning</span>
//                     ) : (
//                       <span className="badge bg-success">✓ Healthy</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOverview;