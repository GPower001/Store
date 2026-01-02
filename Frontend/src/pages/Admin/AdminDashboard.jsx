// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { 
//   Building2, 
//   Package, 
//   AlertTriangle, 
//   Clock, 
//   Users, 
//   ArrowRight,
//   Activity
// } from "lucide-react";
// import { Bar, Doughnut } from "react-chartjs-2";
// import api from "../../utils/api";

// const AdminDashboard = () => {
//   const [overview, setOverview] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchAdminOverview();
//   }, []);

//   const fetchAdminOverview = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/api/admin/overview");
//       setOverview(response.data.data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching admin overview:", err);
//       setError(err.response?.data?.message || "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
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

//   const branchItemsData = {
//     labels: overview?.branches?.map(b => b.branchName) || [],
//     datasets: [{
//       label: "Total Items",
//       data: overview?.branches?.map(b => b.totalItems) || [],
//       backgroundColor: "#0d9488",
//     }]
//   };

//   const stockStatusData = {
//     labels: ["In Stock", "Low Stock", "Expired"],
//     datasets: [{
//       data: [
//         (overview?.totalItems || 0) - (overview?.lowStockItems || 0) - (overview?.expiredItems || 0),
//         overview?.lowStockItems || 0,
//         overview?.expiredItems || 0
//       ],
//       backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
//     }]
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//         <p className="text-gray-600 mt-2">System-wide analytics and insights</p>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total Branches</p>
//               <p className="text-3xl font-bold text-gray-900">{overview?.totalBranches || 0}</p>
//             </div>
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <Building2 className="w-8 h-8 text-blue-600" />
//             </div>
//           </div>
//           <Link to="/dashboard/admin/branches" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-flex items-center gap-1">
//             View all branches <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total Items</p>
//               <p className="text-3xl font-bold text-gray-900">{overview?.totalItems || 0}</p>
//             </div>
//             <div className="bg-green-100 p-3 rounded-lg">
//               <Package className="w-8 h-8 text-green-600" />
//             </div>
//           </div>
//           <p className="text-sm text-gray-500 mt-4">Across all branches</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 border-l-4 border-l-orange-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Low Stock Alerts</p>
//               <p className="text-3xl font-bold text-orange-600">{overview?.lowStockItems || 0}</p>
//             </div>
//             <div className="bg-orange-100 p-3 rounded-lg">
//               <AlertTriangle className="w-8 h-8 text-orange-600" />
//             </div>
//           </div>
//           <p className="text-sm text-gray-500 mt-4">Requires attention</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 border-l-4 border-l-red-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Expired Items</p>
//               <p className="text-3xl font-bold text-red-600">{overview?.expiredItems || 0}</p>
//             </div>
//             <div className="bg-red-100 p-3 rounded-lg">
//               <Clock className="w-8 h-8 text-red-600" />
//             </div>
//           </div>
//           <p className="text-sm text-gray-500 mt-4">Immediate action needed</p>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Activity className="w-5 h-5 text-teal-600" />
//             Items by Branch
//           </h3>
//           <div className="h-[300px]">
//             <Bar
//               data={branchItemsData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: { legend: { display: false } }
//               }}
//             />
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Package className="w-5 h-5 text-teal-600" />
//             Stock Status Distribution
//           </h3>
//           <div className="h-[300px] flex items-center justify-center">
//             <Doughnut
//               data={stockStatusData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: { legend: { position: "bottom" } }
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Branch Cards */}
//       <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-semibold flex items-center gap-2">
//             <Building2 className="w-6 h-6 text-teal-600" />
//             Branch Performance
//           </h3>
//           <Link to="/dashboard/admin/branches" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
//             View All →
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {overview?.branches?.map((branch) => (
//             <Link
//               key={branch._id}
//               to={`/dashboard/admin/branch/${branch._id}`}
//               className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//             >
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <h4 className="font-semibold text-gray-900">{branch.branchName}</h4>
//                   <p className="text-sm text-gray-500">{branch.location}</p>
//                 </div>
//                 <Building2 className="w-5 h-5 text-teal-600" />
//               </div>

//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Total Items:</span>
//                   <span className="font-semibold">{branch.totalItems}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Low Stock:</span>
//                   <span className="font-semibold text-orange-600">{branch.lowStockItems}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Expired:</span>
//                   <span className="font-semibold text-red-600">{branch.expiredItems}</span>
//                 </div>
//               </div>

//               <div className="mt-4 pt-3 border-t border-gray-200">
//                 <span className="text-sm text-teal-600 font-medium flex items-center gap-1">
//                   View Details <ArrowRight className="w-4 h-4" />
//                 </span>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;



// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { 
//   Building2, 
//   Package, 
//   AlertTriangle, 
//   Clock, 
//   Users, 
//   ArrowRight,
//   Activity,
//   TrendingUp,
//   TrendingDown,
//   Bell,
//   RefreshCw,
//   Download,
//   Calendar,
//   DollarSign,
//   ShoppingCart,
//   AlertCircle
// } from "lucide-react";
// import { Bar, Doughnut, Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// } from 'chart.js';
// import api from "../../utils/api";

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// const AdminDashboard = () => {
//   const [overview, setOverview] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [timeRange, setTimeRange] = useState("7days");
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     fetchAdminOverview();
//     fetchRecentNotifications();
//   }, [timeRange]);

//   const fetchAdminOverview = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/api/admin/overview");
//       setOverview(response.data.data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching admin overview:", err);
//       setError(err.response?.data?.message || "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRecentNotifications = async () => {
//     try {
//       const response = await api.get("/api/notifications?limit=5");
//       setNotifications(response.data.data || []);
//     } catch (err) {
//       console.error("Error fetching notifications:", err);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchAdminOverview();
//     await fetchRecentNotifications();
//     setRefreshing(false);
//   };

//   const exportData = () => {
//     const dataStr = JSON.stringify(overview, null, 2);
//     const dataBlob = new Blob([dataStr], { type: 'application/json' });
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
//     link.click();
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-6 h-6 text-red-600" />
//             <div>
//               <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
//               <p className="text-red-700 mt-1">{error}</p>
//               <button 
//                 onClick={handleRefresh}
//                 className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Chart data configurations
//   const branchItemsData = {
//     labels: overview?.branches?.map(b => b.branchName) || [],
//     datasets: [{
//       label: "Total Items",
//       data: overview?.branches?.map(b => b.totalItems) || [],
//       backgroundColor: "rgba(13, 148, 136, 0.8)",
//       borderColor: "#0d9488",
//       borderWidth: 2,
//       borderRadius: 8,
//     }]
//   };

//   const stockStatusData = {
//     labels: ["In Stock", "Low Stock", "Expired"],
//     datasets: [{
//       data: [
//         (overview?.totalItems || 0) - (overview?.lowStockItems || 0) - (overview?.expiredItems || 0),
//         overview?.lowStockItems || 0,
//         overview?.expiredItems || 0
//       ],
//       backgroundColor: [
//         "rgba(16, 185, 129, 0.8)",
//         "rgba(245, 158, 11, 0.8)",
//         "rgba(239, 68, 68, 0.8)"
//       ],
//       borderColor: ["#10b981", "#f59e0b", "#ef4444"],
//       borderWidth: 2,
//     }]
//   };

//   // Mock trend data - in production, fetch from API
//   const trendData = {
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [{
//       label: 'Stock Movements',
//       data: [65, 59, 80, 81, 56, 55, 70],
//       fill: true,
//       backgroundColor: 'rgba(13, 148, 136, 0.1)',
//       borderColor: '#0d9488',
//       tension: 0.4,
//       pointRadius: 4,
//       pointHoverRadius: 6,
//     }]
//   };

//   // Calculate totals and trends
//   const totalValue = overview?.branches?.reduce((sum, b) => sum + (b.totalValue || 0), 0) || 0;
//   const avgStockLevel = overview?.branches?.length > 0 
//     ? Math.round(overview.totalItems / overview.branches.length) 
//     : 0;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header with Actions */}
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//             <p className="text-gray-600 mt-2">System-wide analytics and insights</p>
//             <p className="text-sm text-gray-500 mt-1">
//               <Calendar className="w-4 h-4 inline mr-1" />
//               Last updated: {new Date().toLocaleString()}
//             </p>
//           </div>
          
//           <div className="flex gap-3">
//             <button
//               onClick={handleRefresh}
//               disabled={refreshing}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
//             >
//               <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
//               Refresh
//             </button>
            
//             <button
//               onClick={exportData}
//               className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
//             >
//               <Download className="w-4 h-4" />
//               Export Report
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {/* Total Branches */}
//         <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-4">
//             <div className="bg-white bg-opacity-20 p-3 rounded-lg">
//               <Building2 className="w-8 h-8" />
//             </div>
//             <TrendingUp className="w-5 h-5" />
//           </div>
//           <p className="text-sm opacity-90 mb-1">Total Branches</p>
//           <p className="text-4xl font-bold mb-2">{overview?.totalBranches || 0}</p>
//           <Link to="/dashboard/admin/branches" className="text-sm opacity-90 hover:opacity-100 inline-flex items-center gap-1">
//             View all <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>

//         {/* Total Items */}
//         <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-4">
//             <div className="bg-white bg-opacity-20 p-3 rounded-lg">
//               <Package className="w-8 h-8" />
//             </div>
//             <TrendingUp className="w-5 h-5" />
//           </div>
//           <p className="text-sm opacity-90 mb-1">Total Items</p>
//           <p className="text-4xl font-bold mb-2">{overview?.totalItems || 0}</p>
//           <p className="text-sm opacity-90">Avg per branch: {avgStockLevel}</p>
//         </div>

//         {/* Low Stock Alerts */}
//         <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-4">
//             <div className="bg-white bg-opacity-20 p-3 rounded-lg">
//               <AlertTriangle className="w-8 h-8" />
//             </div>
//             <AlertCircle className="w-5 h-5" />
//           </div>
//           <p className="text-sm opacity-90 mb-1">Low Stock Alerts</p>
//           <p className="text-4xl font-bold mb-2">{overview?.lowStockItems || 0}</p>
//           <Link to="/dashboard/admin/notifications" className="text-sm opacity-90 hover:opacity-100 inline-flex items-center gap-1">
//             View alerts <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>

//         {/* Expired Items */}
//         <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
//           <div className="flex items-center justify-between mb-4">
//             <div className="bg-white bg-opacity-20 p-3 rounded-lg">
//               <Clock className="w-8 h-8" />
//             </div>
//             <TrendingDown className="w-5 h-5" />
//           </div>
//           <p className="text-sm opacity-90 mb-1">Expired Items</p>
//           <p className="text-4xl font-bold mb-2">{overview?.expiredItems || 0}</p>
//           <p className="text-sm opacity-90">Immediate action needed</p>
//         </div>
//       </div>

//       {/* Secondary Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="bg-purple-100 p-2 rounded-lg">
//               <Users className="w-6 h-6 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Total Users</p>
//               <p className="text-2xl font-bold text-gray-900">{overview?.totalUsers || 0}</p>
//             </div>
//           </div>
//           <Link to="/dashboard/admin/users" className="text-sm text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1">
//             Manage users <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="bg-teal-100 p-2 rounded-lg">
//               <ShoppingCart className="w-6 h-6 text-teal-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Avg Stock/Branch</p>
//               <p className="text-2xl font-bold text-gray-900">{avgStockLevel}</p>
//             </div>
//           </div>
//           <p className="text-sm text-gray-500">Based on {overview?.totalBranches || 0} branches</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="bg-yellow-100 p-2 rounded-lg">
//               <Bell className="w-6 h-6 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-600">Active Alerts</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {(overview?.lowStockItems || 0) + (overview?.expiredItems || 0)}
//               </p>
//             </div>
//           </div>
//           <Link to="/dashboard/admin/notifications" className="text-sm text-yellow-600 hover:text-yellow-800 font-medium inline-flex items-center gap-1">
//             View all <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>

//       {/* Charts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Bar Chart */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold flex items-center gap-2">
//               <Activity className="w-5 h-5 text-teal-600" />
//               Items by Branch
//             </h3>
//             <select 
//               className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value)}
//             >
//               <option value="7days">Last 7 days</option>
//               <option value="30days">Last 30 days</option>
//               <option value="90days">Last 90 days</option>
//             </select>
//           </div>
//           <div className="h-[300px]">
//             <Bar
//               data={branchItemsData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: { 
//                   legend: { display: false },
//                   tooltip: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                     padding: 12,
//                     titleFont: { size: 14 },
//                     bodyFont: { size: 13 },
//                   }
//                 },
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     grid: { color: 'rgba(0, 0, 0, 0.05)' }
//                   },
//                   x: {
//                     grid: { display: false }
//                   }
//                 }
//               }}
//             />
//           </div>
//         </div>

//         {/* Doughnut Chart */}
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <Package className="w-5 h-5 text-teal-600" />
//             Stock Status Distribution
//           </h3>
//           <div className="h-[300px] flex items-center justify-center">
//             <Doughnut
//               data={stockStatusData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: { 
//                   legend: { 
//                     position: "bottom",
//                     labels: {
//                       padding: 15,
//                       font: { size: 12 }
//                     }
//                   },
//                   tooltip: {
//                     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                     padding: 12,
//                   }
//                 },
//                 cutout: '65%',
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Trend Chart */}
//       <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
//         <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
//           <TrendingUp className="w-5 h-5 text-teal-600" />
//           Weekly Stock Movement Trend
//         </h3>
//         <div className="h-[200px]">
//           <Line
//             data={trendData}
//             options={{
//               responsive: true,
//               maintainAspectRatio: false,
//               plugins: {
//                 legend: { display: false },
//                 tooltip: {
//                   backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                   padding: 12,
//                 }
//               },
//               scales: {
//                 y: {
//                   beginAtZero: true,
//                   grid: { color: 'rgba(0, 0, 0, 0.05)' }
//                 },
//                 x: {
//                   grid: { display: false }
//                 }
//               }
//             }}
//           />
//         </div>
//       </div>

//       {/* Branch Performance Cards */}
//       <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-semibold flex items-center gap-2">
//             <Building2 className="w-6 h-6 text-teal-600" />
//             Branch Performance Overview
//           </h3>
//           <Link to="/dashboard/admin/branches" className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1">
//             View All Branches <ArrowRight className="w-4 h-4" />
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {overview?.branches?.map((branch) => (
//             <Link
//               key={branch._id}
//               to={`/dashboard/admin/branch/${branch._id}`}
//               className="border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-teal-300 transition-all duration-200 group"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div>
//                   <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition">
//                     {branch.branchName}
//                   </h4>
//                   <p className="text-sm text-gray-500 mt-1">{branch.location}</p>
//                 </div>
//                 <div className="bg-teal-100 p-2 rounded-lg group-hover:bg-teal-200 transition">
//                   <Building2 className="w-5 h-5 text-teal-600" />
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Total Items</span>
//                   <span className="font-semibold text-gray-900 text-lg">{branch.totalItems}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Low Stock</span>
//                   <span className="font-semibold text-orange-600 flex items-center gap-1">
//                     {branch.lowStockItems > 0 && <AlertTriangle className="w-4 h-4" />}
//                     {branch.lowStockItems}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Expired</span>
//                   <span className="font-semibold text-red-600 flex items-center gap-1">
//                     {branch.expiredItems > 0 && <Clock className="w-4 h-4" />}
//                     {branch.expiredItems}
//                   </span>
//                 </div>
//               </div>

//               {/* Health Score Bar */}
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="flex items-center justify-between text-sm mb-2">
//                   <span className="text-gray-600">Health Score</span>
//                   <span className="font-semibold">
//                     {Math.round(((branch.totalItems - branch.lowStockItems - branch.expiredItems) / branch.totalItems) * 100) || 0}%
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-teal-600 h-2 rounded-full transition-all duration-300"
//                     style={{ 
//                       width: `${Math.round(((branch.totalItems - branch.lowStockItems - branch.expiredItems) / branch.totalItems) * 100) || 0}%` 
//                     }}
//                   ></div>
//                 </div>
//               </div>

//               <div className="mt-4 pt-3 border-t border-gray-200">
//                 <span className="text-sm text-teal-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
//                   View Details <ArrowRight className="w-4 h-4" />
//                 </span>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {(!overview?.branches || overview.branches.length === 0) && (
//           <div className="text-center py-12">
//             <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500 text-lg">No branches found</p>
//             <Link 
//               to="/dashboard/create-branch"
//               className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
//             >
//               Create First Branch
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Recent Notifications */}
//       {notifications.length > 0 && (
//         <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold flex items-center gap-2">
//               <Bell className="w-5 h-5 text-teal-600" />
//               Recent Notifications
//             </h3>
//             <Link to="/dashboard/admin/notifications" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
//               View All
//             </Link>
//           </div>
//           <div className="space-y-3">
//             {notifications.slice(0, 5).map((notif) => (
//               <div key={notif._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
//                 <div className={`p-2 rounded-lg ${
//                   notif.type === 'expired' ? 'bg-red-100' : 
//                   notif.type === 'low_stock' ? 'bg-orange-100' : 'bg-blue-100'
//                 }`}>
//                   {notif.type === 'expired' ? <Clock className="w-4 h-4 text-red-600" /> :
//                    notif.type === 'low_stock' ? <AlertTriangle className="w-4 h-4 text-orange-600" /> :
//                    <Bell className="w-4 h-4 text-blue-600" />}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-gray-900">{notif.message}</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {new Date(notif.createdAt).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  Package, 
  AlertTriangle, 
  Clock, 
  Users, 
  ArrowRight,
  Activity,
  TrendingUp,
  TrendingDown,
  Bell,
  RefreshCw,
  Download,
  Calendar,
  ShoppingCart,
  AlertCircle,
  MapPin
} from "lucide-react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from "../../utils/api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7days");
  const [notifications, setNotifications] = useState([]);
  const [trendData, setTrendData] = useState({
    labels: [],
    datasets: [{
      label: 'New Items Added',
      data: [],
      fill: true,
      backgroundColor: 'rgba(13, 148, 136, 0.1)',
      borderColor: '#0d9488',
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  });

  useEffect(() => {
    fetchAdminOverview();
    fetchRecentNotifications();
    fetchStockTrend();
  }, [timeRange]);

  const fetchAdminOverview = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/overview");
      setOverview(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching admin overview:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const response = await api.get("/api/notifications?limit=5");
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchStockTrend = async () => {
    try {
      const response = await api.get("/api/admin/stock-trend?days=7");
      const data = response.data.data;
      
      const labels = data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      
      const counts = data.map(d => d.count);
      
      setTrendData({
        labels,
        datasets: [{
          label: 'New Items Added',
          data: counts,
          fill: true,
          backgroundColor: 'rgba(13, 148, 136, 0.1)',
          borderColor: '#0d9488',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      });
    } catch (err) {
      console.error("Error fetching stock trend:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAdminOverview(),
      fetchRecentNotifications(),
      fetchStockTrend()
    ]);
    setRefreshing(false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(overview, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chart data configurations
  const branchItemsData = {
    labels: overview?.branches?.map(b => b.branchName) || [],
    datasets: [{
      label: "Total Items",
      data: overview?.branches?.map(b => b.totalItems || 0) || [],
      backgroundColor: "rgba(13, 148, 136, 0.8)",
      borderColor: "#0d9488",
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const stockStatusData = {
    labels: ["In Stock", "Low Stock", "Expired"],
    datasets: [{
      data: [
        (overview?.totalItems || 0) - (overview?.lowStockItems || 0) - (overview?.expiredItems || 0),
        overview?.lowStockItems || 0,
        overview?.expiredItems || 0
      ],
      backgroundColor: [
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)"
      ],
      borderColor: ["#10b981", "#f59e0b", "#ef4444"],
      borderWidth: 2,
    }]
  };

  // Calculate totals and trends
  const avgStockLevel = overview?.branches?.length > 0 
    ? Math.round(overview.totalItems / overview.branches.length) 
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Actions */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">System-wide analytics and insights</p>
            <p className="text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Branches */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Building2 className="w-8 h-8" />
            </div>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Branches</p>
          <p className="text-4xl font-bold mb-2">{overview?.totalBranches || 0}</p>
          <Link to="/dashboard/admin/branches" className="text-sm opacity-90 hover:opacity-100 inline-flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Total Items */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Package className="w-8 h-8" />
            </div>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Items</p>
          <p className="text-4xl font-bold mb-2">{overview?.totalItems || 0}</p>
          <p className="text-sm opacity-90">Avg per branch: {avgStockLevel}</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Low Stock Alerts</p>
          <p className="text-4xl font-bold mb-2">{overview?.lowStockItems || 0}</p>
          <Link to="/dashboard/admin/notifications" className="text-sm opacity-90 hover:opacity-100 inline-flex items-center gap-1">
            View alerts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Expired Items */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Clock className="w-8 h-8" />
            </div>
            <TrendingDown className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Expired Items</p>
          <p className="text-4xl font-bold mb-2">{overview?.expiredItems || 0}</p>
          <p className="text-sm opacity-90">Immediate action needed</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totalUsers || 0}</p>
            </div>
          </div>
          <Link to="/dashboard/admin/users" className="text-sm text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1">
            Manage users <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-teal-100 p-2 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Stock/Branch</p>
              <p className="text-2xl font-bold text-gray-900">{avgStockLevel}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Based on {overview?.totalBranches || 0} branches</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {(overview?.lowStockItems || 0) + (overview?.expiredItems || 0)}
              </p>
            </div>
          </div>
          <Link to="/dashboard/admin/notifications" className="text-sm text-yellow-600 hover:text-yellow-800 font-medium inline-flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Items by Branch
            </h3>
            <select 
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <Bar
              data={branchItemsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
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

        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            Stock Status Distribution
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={stockStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: "bottom",
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
                cutout: '65%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          Weekly Stock Movement Trend
        </h3>
        <div className="h-[200px]">
          <Line
            data={trendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
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

      {/* Branch Performance Cards */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            Branch Performance Overview
          </h3>
          <Link to="/dashboard/admin/branches" className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1">
            View All Branches <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview?.branches?.map((branch) => {
            const totalItems = branch.totalItems || 0;
            const lowStock = branch.lowStockItems || 0;
            const expired = branch.expiredItems || 0;
            const healthScore = totalItems > 0 
              ? Math.round(((totalItems - lowStock - expired) / totalItems) * 100) 
              : 0;

            return (
              <Link
                key={branch._id}
                to={`/dashboard/admin/branch/${branch._id}`}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-teal-300 transition-all duration-200 group"
              >
                {/* Branch Icon and Name Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-lg shadow-md group-hover:shadow-lg transition">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base group-hover:text-teal-600 transition">
                        {branch.branchName}
                      </h4>
                      <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        {branch.location || "Location not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <span className="font-semibold text-gray-900 text-lg">{totalItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Low Stock</span>
                    <span className="font-semibold text-orange-600 flex items-center gap-1">
                      {lowStock > 0 && <AlertTriangle className="w-4 h-4" />}
                      {lowStock}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expired</span>
                    <span className="font-semibold text-red-600 flex items-center gap-1">
                      {expired > 0 && <Clock className="w-4 h-4" />}
                      {expired}
                    </span>
                  </div>
                </div>

                {/* Health Score Bar */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Health Score</span>
                    <span className="font-semibold">{healthScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${healthScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* View Details Link */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <span className="text-sm text-teal-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {(!overview?.branches || overview.branches.length === 0) && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No branches found</p>
            <Link 
              to="/dashboard/create-branch"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Create First Branch
            </Link>
          </div>
        )}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-600" />
              Recent Notifications
            </h3>
            <Link to="/dashboard/admin/notifications" className="text-sm text-teal-600 hover:text-teal-800 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className={`p-2 rounded-lg ${
                  notif.type === 'expired' ? 'bg-red-100' : 
                  notif.type === 'low_stock' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {notif.type === 'expired' ? <Clock className="w-4 h-4 text-red-600" /> :
                   notif.type === 'low_stock' ? <AlertTriangle className="w-4 h-4 text-orange-600" /> :
                   <Bell className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;