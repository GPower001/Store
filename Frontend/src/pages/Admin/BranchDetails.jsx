// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { 
//   Building2, 
//   Package, 
//   AlertTriangle, 
//   Clock,
//   ArrowLeft,
//   Search,
//   Filter
// } from "lucide-react";
// import api from "../../utils/api";

// const BranchDetails = () => {
//   const { branchId } = useParams();
//   const [branchData, setBranchData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     fetchBranchDetails();
//   }, [branchId, filter]);

//   const fetchBranchDetails = async () => {
//     try {
//       setLoading(true);
//       const url = filter === "all" 
//         ? `/api/admin/branch/${branchId}`
//         : `/api/admin/branch/${branchId}?filter=${filter}`;
      
//       const response = await api.get(url);
//       setBranchData(response.data.data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching branch details:", err);
//       setError(err.response?.data?.message || "Failed to fetch branch details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredItems = branchData?.items?.filter(item =>
//     item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   const getStatusBadge = (item) => {
//     const today = new Date();
//     if (item.expiryDate && new Date(item.expiryDate) < today) {
//       return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>;
//     }
//     if (item.openingQty <= (item.minStock || 0)) {
//       return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Low Stock</span>;
//     }
//     return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">In Stock</span>;
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
//       <div className="mb-6">
//         <Link 
//           to="/dashboard/admin/branches"
//           className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 mb-4"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Branches
//         </Link>
//         <div className="flex items-center gap-3">
//           <div className="bg-teal-100 p-3 rounded-lg">
//             <Building2 className="w-8 h-8 text-teal-600" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">{branchData?.branch?.branchName}</h1>
//             <p className="text-gray-600">{branchData?.branch?.location}</p>
//           </div>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center gap-3">
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <Package className="w-6 h-6 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Items</p>
//               <p className="text-2xl font-bold text-gray-900">{branchData?.stats?.totalItems || 0}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center gap-3">
//             <div className="bg-orange-100 p-3 rounded-lg">
//               <AlertTriangle className="w-6 h-6 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Low Stock</p>
//               <p className="text-2xl font-bold text-orange-600">{branchData?.stats?.lowStock || 0}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center gap-3">
//             <div className="bg-red-100 p-3 rounded-lg">
//               <Clock className="w-6 h-6 text-red-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Expired</p>
//               <p className="text-2xl font-bold text-red-600">{branchData?.stats?.expired || 0}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search items..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
//             />
//           </div>
          
//           <div className="flex gap-2">
//             <button
//               onClick={() => setFilter("all")}
//               className={`px-4 py-2 rounded-lg font-medium transition ${
//                 filter === "all"
//                   ? "bg-teal-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               All Items
//             </button>
//             <button
//               onClick={() => setFilter("lowstock")}
//               className={`px-4 py-2 rounded-lg font-medium transition ${
//                 filter === "lowstock"
//                   ? "bg-orange-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               Low Stock
//             </button>
//             <button
//               onClick={() => setFilter("expired")}
//               className={`px-4 py-2 rounded-lg font-medium transition ${
//                 filter === "expired"
//                   ? "bg-red-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               Expired
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Items Table */}
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredItems.map((item) => (
//                 <tr key={item._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{item.itemCode}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{item.category}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">{item.openingQty}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500">{item.minStock}</td>
//                   <td className="px-6 py-4 text-sm text-gray-900">
//                     {item.price ? `£${item.price.toFixed(2)}` : '-'}
//                   </td>
//                   <td className="px-6 py-4">{getStatusBadge(item)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {filteredItems.length === 0 && (
//             <div className="text-center py-12">
//               <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-500">No items found</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BranchDetails;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Building2, 
  Package, 
  AlertTriangle, 
  Clock,
  ArrowLeft,
  Search,
  Filter,
  MapPin
} from "lucide-react";
import api from "../../utils/api";

const BranchDetails = () => {
  const { branchId } = useParams();
  const [branchData, setBranchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBranchDetails();
  }, [branchId, filter]);

  const fetchBranchDetails = async () => {
    try {
      setLoading(true);
      const url = filter === "all" 
        ? `/api/admin/branch/${branchId}`
        : `/api/admin/branch/${branchId}?filter=${filter}`;
      
      const response = await api.get(url);
      setBranchData(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching branch details:", err);
      setError(err.response?.data?.message || "Failed to fetch branch details");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = branchData?.items?.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (item) => {
    const today = new Date();
    if (item.expiryDate && new Date(item.expiryDate) < today) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>;
    }
    if (item.openingQty <= (item.minStock || 0)) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">In Stock</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
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
      <div className="mb-6">
        <Link 
          to="/dashboard/admin/branches"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 mb-4 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Branches
        </Link>
        
        {/* Branch Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-4 rounded-xl shadow-md">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {branchData?.branch?.branchName || branchData?.branch?.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <p className="text-base">{branchData?.branch?.location}</p>
              </div>
              {branchData?.branch?.address && (
                <p className="text-sm text-gray-500 mt-2">{branchData.branch.address}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{branchData?.stats?.totalItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-600">{branchData?.stats?.lowStock || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Expired Items</p>
              <p className="text-2xl font-bold text-red-600">{branchData?.stats?.expired || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items by name, code, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilter("lowstock")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "lowstock"
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "expired"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Expired
            </button>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> items
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.itemCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{item.openingQty}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.minStock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.price ? `£${item.price.toFixed(2)}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No items found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm 
                  ? "Try adjusting your search or filters" 
                  : "This branch doesn't have any items yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchDetails;