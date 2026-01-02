// import React, { useState, useEffect, useContext } from "react";
// import { UserContext } from "../context/UserContext"; // ✅ Changed from ../../context
// import { Trash2, Edit, Plus, Eye } from "lucide-react";
// import { Link } from "react-router-dom";
// import api from "../utils/api"; // ✅ Also fix this if needed
// import "bootstrap/dist/css/bootstrap.min.css";


// const BranchManagement = () => {
//   const { user } = useContext(UserContext);
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [editingBranch, setEditingBranch] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     location: "",
//     contactPerson: "",
//     phone: "",
//   });

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   const fetchBranches = async () => {
//     try {
//       const res = await api.get("/api/branches");
//       setBranches(res.data.data);
//       setLoading(false);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to fetch branches");
//       setLoading(false);
//     }
//   };

//   const handleOpenModal = (branchToEdit = null) => {
//     if (branchToEdit) {
//       setEditingBranch(branchToEdit);
//       setFormData({
//         name: branchToEdit.name,
//         location: branchToEdit.location,
//         contactPerson: branchToEdit.contactPerson || "",
//         phone: branchToEdit.phone || "",
//       });
//     } else {
//       setEditingBranch(null);
//       setFormData({ name: "", location: "", contactPerson: "", phone: "" });
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingBranch(null);
//     setFormData({ name: "", location: "", contactPerson: "", phone: "" });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (editingBranch) {
//         await api.put(`/api/branches/${editingBranch._id}`, formData);
//       } else {
//         await api.post("/api/branches", formData);
//       }
//       fetchBranches();
//       handleCloseModal();
//     } catch (err) {
//       setError(err.response?.data?.message || "Operation failed");
//     }
//   };

//   const handleDeleteBranch = async (branchId) => {
//     if (window.confirm("Are you sure you want to delete this branch?")) {
//       try {
//         await api.delete(`/api/branches/${branchId}`);
//         fetchBranches();
//       } catch (err) {
//         setError(err.response?.data?.message || "Failed to delete branch");
//       }
//     }
//   };

//   if (!user || user.role !== "Admin") {
//     return <div className="alert alert-danger">Access denied.</div>;
//   }

//   if (loading) return <div className="text-center mt-5">Loading...</div>;

//   return (
//     <div className="p-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Branch Management</h2>
//         <button
//           className="btn btn-primary d-flex align-items-center gap-2"
//           onClick={() => handleOpenModal()}
//         >
//           <Plus size={18} /> Add Branch
//         </button>
//       </div>

//       {error && <div className="alert alert-danger">{error}</div>}

//       {/* Branches Grid */}
//       <div className="row">
//         {branches.map((branch) => (
//           <div key={branch._id} className="col-md-6 col-lg-4 mb-3">
//             <div className="card shadow-sm h-100">
//               <div className="card-body">
//                 <h5 className="card-title text-primary fw-bold">
//                   {branch.name}
//                 </h5>
//                 <p className="card-text text-muted mb-2">
//                   <strong>📍 Location:</strong> {branch.location}
//                 </p>
//                 {branch.contactPerson && (
//                   <p className="card-text mb-2">
//                     <strong>👤 Contact:</strong> {branch.contactPerson}
//                   </p>
//                 )}
//                 {branch.phone && (
//                   <p className="card-text mb-3">
//                     <strong>📞 Phone:</strong> {branch.phone}
//                   </p>
//                 )}
//               </div>
//               <div className="card-footer bg-light d-flex gap-2">
//                 <Link
//                   to={`/dashboard/admin/branch/${branch._id}`}
//                   className="btn btn-sm btn-info flex-grow-1 d-flex align-items-center justify-content-center gap-1"
//                 >
//                   <Eye size={16} /> View
//                 </Link>
//                 <button
//                   className="btn btn-sm btn-warning flex-grow-1"
//                   onClick={() => handleOpenModal(branch)}
//                 >
//                   <Edit size={16} />
//                 </button>
//                 <button
//                   className="btn btn-sm btn-danger flex-grow-1"
//                   onClick={() => handleDeleteBranch(branch._id)}
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div
//           className="modal d-block"
//           style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//         >
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5>{editingBranch ? "Edit Branch" : "Add Branch"}</h5>
//                 <button
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>
//               <form onSubmit={handleSubmit}>
//                 <div className="modal-body">
//                   <div className="mb-3">
//                     <label className="form-label">Branch Name</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Location</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="location"
//                       value={formData.location}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Contact Person</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="contactPerson"
//                       value={formData.contactPerson}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Phone</label>
//                     <input
//                       type="tel"
//                       className="form-control"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={handleCloseModal}
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     {editingBranch ? "Update" : "Create"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BranchManagement;