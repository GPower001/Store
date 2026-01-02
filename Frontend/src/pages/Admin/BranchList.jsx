// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { 
//   Building2, 
//   Package, 
//   AlertTriangle, 
//   TrendingUp, 
//   Search,
//   ArrowUpDown,
//   Eye
// } from "lucide-react";
// import { Bar } from "react-chartjs-2";
// import api from "../../utils/api";

// const BranchList = () => {
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortBy, setSortBy] = useState("totalItems");
//   const [sortOrder, setSortOrder] = useState("desc");

//   useEffect(() => {
//     fetchBranchSummary();
//   }, []);

//   const fetchBranchSummary = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/api/admin/branch-summary");
//       setBranches(response.data.data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching branch summary:", err);
//       setError(err.response?.data?.message || "Failed to fetch branches");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortBy(field);
//       setSortOrder("desc");
//     }
//   };

//   const filteredBranches = branches
//     .filter(branch => 
//       branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       branch.location?.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       const aVal = a[sortBy] || 0;
//       const bVal = b[sortBy] || 0;
//       return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
//     });

//   // Chart data
//   const comparisonData = {
//     labels: filteredBranches.map(b => b.branchName),
//     datasets: [
//       {
//         label: "Total Items",
//         data: filteredBranches.map(b => b.totalItems),
//         backgroundColor: "#0d9488",
//       },
//       {
//         label: "Low Stock",
//         data: filteredBranches.map(b => b.lowStock),
//         backgroundColor: "#f59e0b",
//       }
//     ]
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//           <p className="text-red-700">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Branch Comparison</h1>
//         <p className="text-gray-600 mt-2">Compare performance across all branches</p>
//       </div>

//       {/* Search Bar */}
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search branches by name or location..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//           />
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//         <h3 className="text-lg font-semibold mb-4">Branch Inventory Comparison</h3>
//         <div className="h-[300px]">
//           <Bar
//             data={comparisonData}
//             options={{
//               responsive: true,
//               maintainAspectRatio: false,
//               plugins: {
//                 legend: { position: "top" }
//               }
//             }}
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Branch
//               </th>
//               <th 
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleSort("totalItems")}
//               >
//                 <div className="flex items-center gap-1">
//                   Total Items
//                   <ArrowUpDown className="w-4 h-4" />
//                 </div>
//               </th>
//               <th 
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleSort("totalQty")}
//               >
//                 <div className="flex items-center gap-1">
//                   Total Quantity
//                   <ArrowUpDown className="w-4 h-4" />
//                 </div>
//               </th>
//               <th 
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleSort("lowStock")}
//               >
//                 <div className="flex items-center gap-1">
//                   Low Stock
//                   <ArrowUpDown className="w-4 h-4" />
//                 </div>
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Avg Stock
//               </th>
//               <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {filteredBranches.map((branch) => (
//               <tr key={branch.branchId} className="hover:bg-gray-50">
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-3">
//                     <div className="bg-teal-100 p-2 rounded-lg">
//                       <Building2 className="w-5 h-5 text-teal-600" />
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">{branch.branchName}</div>
//                       <div className="text-sm text-gray-500">{branch.location}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-2">
//                     <Package className="w-4 h-4 text-gray-400" />
//                     <span className="font-semibold text-gray-900">{branch.totalItems}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">
//                   <span className="text-gray-900">{branch.totalQty?.toLocaleString()}</span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-2">
//                     {branch.lowStock > 0 ? (
//                       <>
//                         <AlertTriangle className="w-4 h-4 text-orange-500" />
//                         <span className="font-semibold text-orange-600">{branch.lowStock}</span>
//                       </>
//                     ) : (
//                       <span className="text-green-600">0</span>
//                     )}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-2">
//                     <TrendingUp className="w-4 h-4 text-gray-400" />
//                     <span className="text-gray-900">{branch.avgStock}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 text-center">
//                   <Link
//                     to={`/dashboard/admin/branch/${branch.branchId}`}
//                     className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 font-medium"
//                   >
//                     <Eye className="w-4 h-4" />
//                     View Details
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {filteredBranches.length === 0 && (
//           <div className="text-center py-12">
//             <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No branches found</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BranchList;


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  ArrowUpDown,
  Eye,
  MapPin
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import api from "../../utils/api";

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalItems");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchBranchSummary();
  }, []);

  const fetchBranchSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/branch-summary");
      setBranches(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching branch summary:", err);
      setError(err.response?.data?.message || "Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const filteredBranches = branches
    .filter(branch => 
      branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  // Chart data
  const comparisonData = {
    labels: filteredBranches.map(b => b.branchName),
    datasets: [
      {
        label: "Total Items",
        data: filteredBranches.map(b => b.totalItems),
        backgroundColor: "#0d9488",
        borderRadius: 8,
      },
      {
        label: "Low Stock",
        data: filteredBranches.map(b => b.lowStock),
        backgroundColor: "#f59e0b",
        borderRadius: 8,
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Comparison</h1>
        <p className="text-gray-600 mt-2">Compare performance across all branches</p>
        <div className="mt-3 text-sm text-gray-500">
          Total Branches: <span className="font-semibold text-gray-900">{branches.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search branches by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredBranches.length}</span> branches
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          Branch Inventory Comparison
        </h3>
        <div className="h-[300px]">
          <Bar
            data={comparisonData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { 
                  position: "top",
                  labels: {
                    padding: 15,
                    font: { size: 12 }
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                  grid: { display: false }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleSort("totalItems")}
                >
                  <div className="flex items-center gap-1">
                    Total Items
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleSort("totalQty")}
                >
                  <div className="flex items-center gap-1">
                    Total Quantity
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleSort("lowStock")}
                >
                  <div className="flex items-center gap-1">
                    Low Stock
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBranches.map((branch) => (
                <tr key={branch.branchId} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-lg shadow-sm">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">{branch.branchName}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          {branch.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{branch.totalItems}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">{branch.totalQty?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {branch.lowStock > 0 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold text-orange-600">{branch.lowStock}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-600 font-medium">0</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{branch.avgStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/dashboard/admin/branch/${branch.branchId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-teal-600 hover:text-white hover:bg-teal-600 font-medium border border-teal-600 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBranches.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No branches found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm 
                  ? "Try adjusting your search term" 
                  : "Create your first branch to get started"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchList;