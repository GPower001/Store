// import React, { useState, useEffect, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { UserContext } from "../context/UserContext"; // ✅ Changed from ../../context
// import { ArrowLeft, AlertTriangle, TrendingUp } from "lucide-react";
// import api from "../utils/api"; // ✅ Changed from ../../utils
// import "bootstrap/dist/css/bootstrap.min.css";

// const BranchDetails = () => {
//   const { branchId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useContext(UserContext);
//   const [branch, setBranch] = useState(null);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState("all"); // all, lowstock, expired

//   useEffect(() => {
//     fetchBranchDetails();
//   }, [branchId, filter]);

//   const fetchBranchDetails = async () => {
//     try {
//       const res = await api.get(`/api/admin/branch/${branchId}?filter=${filter}`);
//       setBranch(res.data.data.branch);
//       setItems(res.data.data.items);
//       setLoading(false);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch branch details");
//       setLoading(false);
//     }
//   };

//   if (!user || user.role !== "Admin") {
//     return <div className="alert alert-danger">Access denied.</div>;
//   }

//   if (loading) return <div className="text-center mt-5">Loading...</div>;

//   if (!branch) return <div className="alert alert-danger">Branch not found</div>;

//   return (
//     <div className="p-4">
//       {/* Back Button */}
//       <button
//         className="btn btn-secondary mb-3 d-flex align-items-center gap-2"
//         onClick={() => navigate("/dashboard/admin/branches")}
//       >
//         <ArrowLeft size={18} /> Back to Branches
//       </button>

//       {/* Branch Header */}
//       <div className="card mb-4 shadow-sm">
//         <div className="card-body">
//           <h2 className="mb-2">{branch.name}</h2>
//           <p className="text-muted mb-2">📍 {branch.location}</p>
//           {branch.contactPerson && (
//             <p className="mb-1">
//               <strong>Contact:</strong> {branch.contactPerson}
//             </p>
//           )}
//           {branch.phone && (
//             <p>
//               <strong>Phone:</strong> {branch.phone}
//             </p>
//           )}
//         </div>
//       </div>

//       {error && <div className="alert alert-danger">{error}</div>}

//       {/* Filter Buttons */}
//       <div className="mb-3 d-flex gap-2">
//         <button
//           className={`btn ${
//             filter === "all" ? "btn-primary" : "btn-outline-primary"
//           }`}
//           onClick={() => setFilter("all")}
//         >
//           All Items ({items.length})
//         </button>
//         <button
//           className={`btn ${
//             filter === "lowstock"
//               ? "btn-warning"
//               : "btn-outline-warning"
//           }`}
//           onClick={() => setFilter("lowstock")}
//         >
//           <AlertTriangle size={16} className="me-1" /> Low Stock
//         </button>
//         <button
//           className={`btn ${
//             filter === "expired" ? "btn-danger" : "btn-outline-danger"
//           }`}
//           onClick={() => setFilter("expired")}
//         >
//           Expired
//         </button>
//       </div>

//       {/* Items Table */}
//       <div className="table-responsive">
//         <table className="table table-hover">
//           <thead className="table-dark">
//             <tr>
//               <th>Item Name</th>
//               <th>Category</th>
//               <th>Current Stock</th>
//               <th>Min Stock</th>
//               <th>Expiry Date</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length > 0 ? (
//               items.map((item) => {
//                 const isLowStock = item.currentQty < item.minStock;
//                 const isExpired = new Date(item.expiryDate) < new Date();

//                 return (
//                   <tr key={item._id}>
//                     <td className="fw-bold">{item.name}</td>
//                     <td>{item.category}</td>
//                     <td>{item.currentQty}</td>
//                     <td>{item.minStock}</td>
//                     <td>
//                       {item.expiryDate
//                         ? new Date(item.expiryDate).toLocaleDateString()
//                         : "N/A"}
//                     </td>
//                     <td>
//                       {isExpired ? (
//                         <span className="badge bg-danger">Expired</span>
//                       ) : isLowStock ? (
//                         <span className="badge bg-warning">Low Stock</span>
//                       ) : (
//                         <span className="badge bg-success">Healthy</span>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan="6" className="text-center text-muted py-4">
//                   No items found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default BranchDetails;