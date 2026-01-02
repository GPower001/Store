// import React, { useState, useEffect } from "react";
// import { Building2, MapPin, Save, X, Trash2, Edit } from "lucide-react";
// import api from "../utils/api";

// const CreateBranch = () => {
//   const [formData, setFormData] = useState({
//     branchName: "",
//     location: "",
//   });

//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchingBranches, setFetchingBranches] = useState(true);
//   const [popup, setPopup] = useState(null);

//   const showPopup = (type, message) => {
//     setPopup({ type, message });
//     setTimeout(() => setPopup(null), 3000);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleReset = () => {
//     setFormData({
//       branchName: "",
//       location: "",
//     });
//   };

//   // Fetch branches on component mount
//   const fetchBranches = async () => {
//     try {
//       setFetchingBranches(true);
//       const response = await api.get("/api/branches");
//       setBranches(response.data);
//     } catch (error) {
//       console.error("Failed to fetch branches:", error);
//       showPopup("error", "Failed to load branches");
//     } finally {
//       setFetchingBranches(false);
//     }
//   };

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setPopup(null);

//     if (!formData.branchName || !formData.location) {
//       showPopup("error", "Please fill in all required fields.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await api.post("/api/branches", formData);

//       showPopup("success", "Branch created successfully!");
      
//       // Add new branch to the list
//       setBranches([...branches, response.data]);
      
//       // Reset form after successful creation
//       handleReset();
//     } catch (error) {
//       let errMsg =
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         "Failed to create branch. Please try again.";

//       if (
//         error.response?.data?.error?.includes("E11000") ||
//         error.response?.data?.message?.includes("duplicate key")
//       ) {
//         errMsg = "Branch name already exists.";
//       }

//       showPopup("error", errMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (branchId) => {
//     if (!window.confirm("Are you sure you want to delete this branch?")) {
//       return;
//     }

//     try {
//       await api.delete(`/api/branches/${branchId}`);
//       setBranches(branches.filter(branch => branch._id !== branchId));
//       showPopup("success", "Branch deleted successfully!");
//     } catch (error) {
//       showPopup("error", "Failed to delete branch. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
//       {/* Popup Notification */}
//       {popup && (
//         <div
//           className={`fixed z-50 left-1/2 top-10 transform -translate-x-1/2 ${
//             popup.type === "success"
//               ? "bg-green-500 text-white"
//               : "bg-red-500 text-white"
//           } px-6 py-3 rounded shadow-lg animate-fade-in-up`}
//           style={{ minWidth: 250, textAlign: "center" }}
//         >
//           {popup.message}
//         </div>
//       )}

//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header & Form */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center gap-3 bg-teal-800 text-white p-6 rounded-t-lg">
//             <Building2 className="w-8 h-8" />
//             <div>
//               <h1 className="text-2xl font-bold">Create New Branch</h1>
//               <p className="text-teal-100 text-sm mt-1">
//                 Add a new branch location to your inventory system
//               </p>
//             </div>
//           </div>

//           {/* Form */}
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Branch Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="branchName"
//                   value={formData.branchName}
//                   onChange={handleChange}
//                   placeholder="e.g., Downtown Branch"
//                   className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Location <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="location"
//                   value={formData.location}
//                   onChange={handleChange}
//                   placeholder="e.g., New York, NY"
//                   className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-3">
//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md text-white font-medium transition-colors ${
//                   loading
//                     ? "bg-teal-400 cursor-not-allowed"
//                     : "bg-teal-600 hover:bg-teal-700"
//                 }`}
//               >
//                 <Save className="w-5 h-5" />
//                 {loading ? "Creating..." : "Create Branch"}
//               </button>

//               <button
//                 type="button"
//                 onClick={handleReset}
//                 disabled={loading}
//                 className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
//               >
//                 <X className="w-5 h-5" />
//                 Reset
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Branches List */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="flex items-center gap-3 bg-teal-800 text-white p-6 rounded-t-lg">
//             <Building2 className="w-6 h-6" />
//             <h2 className="text-xl font-bold">Existing Branches</h2>
//           </div>

//           <div className="p-6">
//             {fetchingBranches ? (
//               <div className="text-center py-8 text-gray-500">
//                 Loading branches...
//               </div>
//             ) : branches.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 No branches created yet. Create your first branch above.
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Branch Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Location
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Created Date
//                       </th>
//                       <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {branches.map((branch) => (
//                       <tr key={branch._id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <Building2 className="w-5 h-5 text-teal-600" />
//                             <span className="font-medium text-gray-900">
//                               {branch.branchName}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center gap-2">
//                             <MapPin className="w-4 h-4 text-gray-400" />
//                             <span className="text-gray-700">{branch.location}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
//                           {branch.createdAt
//                             ? new Date(branch.createdAt).toLocaleDateString()
//                             : "N/A"}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-center">
//                           <button
//                             onClick={() => handleDelete(branch._id)}
//                             className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Animation Styles */}
//       <style>
//         {`
//           .animate-fade-in-up {
//             animation: fadeInUp 0.4s;
//           }
//           @keyframes fadeInUp {
//             from { opacity: 0; transform: translate(-50%, 40px); }
//             to { opacity: 1; transform: translate(-50%, 0); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default CreateBranch;