// // import { useState, useEffect } from "react";
// // import { Bar } from "react-chartjs-2";
// // import { Card, CardContent } from "../components/ui/card";
// // import { Bell, AlertTriangle, Clock } from "lucide-react";
// // import { Link } from "react-router-dom";
// // import api from "../utils/api"; // ✅ secured axios instance
// // import {
// //   Chart as ChartJS,
// //   BarElement,
// //   CategoryScale,
// //   LinearScale,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";

// // ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// // const Dashboard = () => {
// //   const [stockData, setStockData] = useState({ products: 0 });
// //   const [lowStockItems, setLowStockItems] = useState([]);
// //   const [expiredItems, setExpiredItems] = useState([]);
// //   const [inventory, setInventory] = useState([]);

// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   const [revenueData, setRevenueData] = useState({
// //     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
// //     datasets: [
// //       {
// //         label: "Revenue",
// //         data: [20, 45, 30, 50, 40, 60, 30, 55],
// //         backgroundColor: "#009688",
// //       },
// //     ],
// //   });

// //   const fetchDashboardData = async () => {
// //   try {
// //     setLoading(true);

// //     // Inventory
// //     const inventoryRes = await api.get("/api/items");
// //     const inventoryData = inventoryRes?.data?.data || [];
// //     setInventory(inventoryData);
// //     setStockData({ products: inventoryData.length });

// //     // Low stock calculation
// //     const lowStockData = inventoryData.filter(item => {
// //       const stock = Number(item.openingQty ?? 0);
// //       const minStock = Number(item.minStock ?? 0);
// //       return stock <= minStock;
// //     });
// //     setLowStockItems(lowStockData);

// //     // Expired items
// //     const expiredRes = await api.get("/api/items/expired");
// //     const expiredData = expiredRes?.data?.data || [];
// //     const today = new Date();
// //     const filteredExpired = expiredData.filter(
// //       item => item.expiryDate && new Date(item.expiryDate) < today
// //     );
// //     setExpiredItems(filteredExpired);

// //     setError(null);
// //   } catch (err) {
// //     console.error("Dashboard fetch error:", err);
// //     setError(
// //       err.response?.data?.message || "Failed to fetch dashboard data."
// //     );
// //   } finally {
// //     setLoading(false);
// //   }
// // };


// //   useEffect(() => {
// //     fetchDashboardData();
// //   }, []);

// //   if (loading)
// //     return (
// //       <div className="flex justify-center items-center py-12">
// //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// //       </div>
// //     );

// //   if (error)
// //     return (
// //       <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
// //         <p className="text-sm text-red-700">{error}</p>
// //       </div>
// //     );

// //   return (
// //     <div className="p-6">
// //       <h1 className="text-xl font-semibold mb-6">
// //         Hello <span className="font-bold">Mark!</span>{" "}
// //         <span className="text-teal-500">Analytics For this week</span>
// //       </h1>

// //       {/* Stock Cards */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
// //         {/* Products */}
// //         <Card className="p-4">
// //           <CardContent className="flex flex-col gap-2 text-center">
// //             <h2 className="text-lg font-medium">Products</h2>
// //             <p className="text-2xl font-bold">{stockData.products} items</p>
// //             <Link to="categories">
// //               <button className="bg-teal-500 text-white px-4 py-1 rounded-md">
// //                 View
// //               </button>
// //             </Link>
// //           </CardContent>
// //         </Card>

// //         {/* Low Stock */}
// //         {lowStockItems.length > 0 && (
// //           <Card className="p-4 border border-red-500">
// //             <CardContent className="flex flex-col gap-2 text-center">
// //               <div className="flex justify-between items-center">
// //                 <h2 className="text-lg font-medium">Low Stock</h2>
// //                 <AlertTriangle className="text-red-500" size={20} />
// //               </div>
// //               <p className="text-2xl font-bold">{lowStockItems.length} items</p>
// //               <Link to="low-stock">
// //                 <button className="bg-teal-500 text-white px-4 py-1 rounded-md">
// //                   View
// //                 </button>
// //               </Link>
// //             </CardContent>
// //           </Card>
// //         )}

// //         {/* Expired Items */}
// //         {expiredItems.length > 0 && (
// //           <Card className="p-4 border border-yellow-500">
// //             <CardContent className="flex flex-col gap-2 text-center">
// //               <div className="flex justify-between items-center">
// //                 <h2 className="text-lg font-medium">Expired Products</h2>
// //                 <Clock className="text-yellow-500" size={20} />
// //               </div>
// //               <p className="text-2xl font-bold">{expiredItems.length} items</p>
// //               <Link to="expired-products">
// //                 <button className="bg-yellow-500 text-white px-4 py-1 rounded-md">
// //                   View
// //                 </button>
// //               </Link>
// //             </CardContent>
// //           </Card>
// //         )}
// //       </div>

// //       {/* Revenue Chart */}
// //       <Card className="p-4 h-[50vh] min-h-0">
// //         <CardContent className="h-full flex flex-col min-h-0">
// //           <h2 className="text-lg font-medium">Revenue</h2>
// //           <p className="text-2xl font-bold text-teal-600">£150,000</p>
// //           <div className="flex-grow w-full min-h-0">
// //             <Bar data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default Dashboard;


// import { useState, useEffect } from "react";
// import { Bar, Line, Pie } from "react-chartjs-2";
// import { Card, CardContent } from "../components/ui/card";
// import { Bell, AlertTriangle, Clock, Package, DollarSign, TrendingUp } from "lucide-react";
// import { Link } from "react-router-dom";
// import api from "../utils/api";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   LineElement,
//   PointElement,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   LineElement,
//   PointElement,
//   ArcElement
// );

// const Dashboard = () => {
//   const [stockData, setStockData] = useState({ products: 0 });
//   const [lowStockItems, setLowStockItems] = useState([]);
//   const [expiredItems, setExpiredItems] = useState([]);
//   const [inventory, setInventory] = useState([]);
//   const [activeTab, setActiveTab] = useState('overview');

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Sample data for analytics
//   const salesData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: "Sales",
//         data: [4000, 3000, 5000, 4500, 6000, 5500],
//         borderColor: "#009688",
//         backgroundColor: "rgba(0, 150, 136, 0.1)",
//         tension: 0.4,
//       },
//     ],
//   };

//   const revenueData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
//     datasets: [
//       {
//         label: "Revenue",
//         data: [20000, 45000, 30000, 50000, 40000, 60000, 30000, 55000],
//         backgroundColor: "#009688",
//       },
//     ],
//   };

//   const categoryData = {
//     labels: ["Medications", "Consumables", "General", "Apparatus", "Skin Care"],
//     datasets: [
//       {
//         data: [45, 25, 15, 10, 5],
//         backgroundColor: [
//           "#3b82f6",
//           "#8b5cf6",
//           "#10b981",
//           "#f59e0b",
//           "#ef4444",
//         ],
//       },
//     ],
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Inventory
//       const inventoryRes = await api.get("/api/items");
//       const inventoryData = inventoryRes?.data?.data || [];
//       setInventory(inventoryData);
//       setStockData({ products: inventoryData.length });

//       // Low stock calculation
//       const lowStockData = inventoryData.filter((item) => {
//         const stock = Number(item.openingQty ?? 0);
//         const minStock = Number(item.minStock ?? 0);
//         return stock <= minStock;
//       });
//       setLowStockItems(lowStockData);

//       // Expired items
//       const expiredRes = await api.get("/api/items/expired");
//       const expiredData = expiredRes?.data?.data || [];
//       const today = new Date();
//       const filteredExpired = expiredData.filter(
//         (item) => item.expiryDate && new Date(item.expiryDate) < today
//       );
//       setExpiredItems(filteredExpired);

//       setError(null);
//     } catch (err) {
//       console.error("Dashboard fetch error:", err);
//       setError(
//         err.response?.data?.message || "Failed to fetch dashboard data."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center py-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
//         <p className="text-sm text-red-700">{error}</p>
//       </div>
//     );

//   return (
//     <div className="p-4 sm:p-6">
//       <h1 className="text-xl font-semibold mb-6">
//         Hello <span className="font-bold">Mark!</span>{" "}
//         <span className="text-teal-500">Analytics For this week</span>
//       </h1>

//       {/* Stock Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {/* Products */}
//         <Card className="p-4 bg-white shadow-sm">
//           <CardContent className="flex items-center justify-between p-0">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total Products</p>
//               <p className="text-2xl font-bold">{stockData.products}</p>
//               <Link to="categories">
//                 <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
//                   View
//                 </button>
//               </Link>
//             </div>
//             <div className="bg-blue-500 p-3 rounded-lg">
//               <Package className="w-6 h-6 text-white" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Total Revenue */}
//         <Card className="p-4 bg-white shadow-sm">
//           <CardContent className="flex items-center justify-between p-0">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
//               <p className="text-2xl font-bold">£150K</p>
//               <p className="text-sm text-green-600 mt-2">+23% this month</p>
//             </div>
//             <div className="bg-green-500 p-3 rounded-lg">
//               <DollarSign className="w-6 h-6 text-white" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Low Stock */}
//         {lowStockItems.length > 0 && (
//           <Card className="p-4 bg-white shadow-sm border-l-4 border-orange-500">
//             <CardContent className="flex items-center justify-between p-0">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Low Stock</p>
//                 <p className="text-2xl font-bold">{lowStockItems.length}</p>
//                 <Link to="low-stock">
//                   <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
//                     View
//                   </button>
//                 </Link>
//               </div>
//               <div className="bg-orange-500 p-3 rounded-lg">
//                 <AlertTriangle className="w-6 h-6 text-white" />
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Expired Items */}
//         {expiredItems.length > 0 && (
//           <Card className="p-4 bg-white shadow-sm border-l-4 border-yellow-500">
//             <CardContent className="flex items-center justify-between p-0">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Expired Items</p>
//                 <p className="text-2xl font-bold">{expiredItems.length}</p>
//                 <Link to="expired-products">
//                   <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
//                     View
//                   </button>
//                 </Link>
//               </div>
//               <div className="bg-yellow-500 p-3 rounded-lg">
//                 <Clock className="w-6 h-6 text-white" />
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Analytics Tabs */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//         <div className="border-b border-gray-200">
//           <nav className="flex gap-8 px-6">
//             {['overview', 'revenue', 'analytics'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
//                   activeTab === tab
//                     ? 'border-teal-600 text-teal-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="p-6">
//           {activeTab === 'overview' && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
//                 <div className="h-[300px]">
//                   <Line
//                     data={salesData}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           display: true,
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
//                 <div className="h-[300px] flex items-center justify-center">
//                   <Pie
//                     data={categoryData}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           position: 'bottom',
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'revenue' && (
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
//               <p className="text-3xl font-bold text-teal-600 mb-6">£150,000</p>
//               <div className="h-[400px]">
//                 <Bar
//                   data={revenueData}
//                   options={{
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     plugins: {
//                       legend: {
//                         display: true,
//                       },
//                     },
//                   }}
//                 />
//               </div>
//             </div>
//           )}

//           {activeTab === 'analytics' && (
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Revenue Analysis</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <Card className="p-4">
//                   <CardContent className="p-0">
//                     <p className="text-sm text-gray-600 mb-1">Total Sales</p>
//                     <p className="text-2xl font-bold">234</p>
//                     <p className="text-sm text-green-600 mt-1">+18% from last month</p>
//                   </CardContent>
//                 </Card>
//                 <Card className="p-4">
//                   <CardContent className="p-0">
//                     <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
//                     <p className="text-2xl font-bold">£641</p>
//                     <p className="text-sm text-green-600 mt-1">+12% from last month</p>
//                   </CardContent>
//                 </Card>
//                 <Card className="p-4">
//                   <CardContent className="p-0">
//                     <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
//                     <p className="text-2xl font-bold">3.2%</p>
//                     <p className="text-sm text-red-600 mt-1">-2% from last month</p>
//                   </CardContent>
//                 </Card>
//               </div>
//               <div className="h-[400px]">
//                 <Bar
//                   data={revenueData}
//                   options={{
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     plugins: {
//                       legend: {
//                         display: true,
//                       },
//                     },
//                   }}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// import { useState, useEffect, useContext } from "react";
// import { Bar, Line, Pie } from "react-chartjs-2";
// import { Card, CardContent } from "../components/ui/card";
// import { Bell, AlertTriangle, Clock, Package, DollarSign, TrendingUp } from "lucide-react";
// import { Link } from "react-router-dom";
// import api from "../utils/api";
// import { UserContext } from "../context/UserContext";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   LineElement,
//   PointElement,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   LineElement,
//   PointElement,
//   ArcElement
// );

// const Dashboard = () => {
//   const [stockData, setStockData] = useState({ products: 0 });
//   const [lowStockItems, setLowStockItems] = useState([]);
//   const [expiredItems, setExpiredItems] = useState([]);
//   const [inventory, setInventory] = useState([]);
//   const [activeTab, setActiveTab] = useState('overview');

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const { user } = useContext(UserContext);
//   const isAdmin = user?.role === "Admin";

//   // Sample data for analytics
//   const salesData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: "Sales",
//         data: [4000, 3000, 5000, 4500, 6000, 5500],
//         borderColor: "#009688",
//         backgroundColor: "rgba(0, 150, 136, 0.1)",
//         tension: 0.4,
//       },
//     ],
//   };

//   const revenueData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
//     datasets: [
//       {
//         label: "Revenue",
//         data: [20000, 45000, 30000, 50000, 40000, 60000, 30000, 55000],
//         backgroundColor: "#009688",
//       },
//     ],
//   };

//   const categoryData = {
//     labels: ["Medications", "Consumables", "General", "Apparatus", "Skin Care"],
//     datasets: [
//       {
//         data: [45, 25, 15, 10, 5],
//         backgroundColor: [
//           "#3b82f6",
//           "#8b5cf6",
//           "#10b981",
//           "#f59e0b",
//           "#ef4444",
//         ],
//       },
//     ],
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Inventory
//       const inventoryRes = await api.get("/api/items");
//       const inventoryData = inventoryRes?.data?.data || [];
//       setInventory(inventoryData);
//       setStockData({ products: inventoryData.length });

//       // Low stock calculation
//       const lowStockData = inventoryData.filter((item) => {
//         const stock = Number(item.openingQty ?? 0);
//         const minStock = Number(item.minStock ?? 0);
//         return stock <= minStock;
//       });
//       setLowStockItems(lowStockData);

//       // Expired items
//       const expiredRes = await api.get("/api/items/expired");
//       const expiredData = expiredRes?.data?.data || [];
//       const today = new Date();
//       const filteredExpired = expiredData.filter(
//         (item) => item.expiryDate && new Date(item.expiryDate) < today
//       );
//       setExpiredItems(filteredExpired);

//       setError(null);
//     } catch (err) {
//       console.error("Dashboard fetch error:", err);
//       setError(
//         err.response?.data?.message || "Failed to fetch dashboard data."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center py-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
//         <p className="text-sm text-red-700">{error}</p>
//       </div>
//     );

//   return (
//     <div className="p-4 sm:p-6">
//       <h1 className="text-xl font-semibold mb-6">
//         Hello <span className="font-bold">{user?.name || "Mark"}!</span>{" "}
//         <span className="text-teal-500">Analytics For this week</span>
//       </h1>

//       {/* Stock Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {/* Products */}
//         <Card className="p-4 bg-white shadow-sm">
//           <CardContent className="flex items-center justify-between p-0">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total Products</p>
//               <p className="text-2xl font-bold">{stockData.products}</p>
//               <Link to="categories">
//                 <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
//                   View
//                 </button>
//               </Link>
//             </div>
//             <div className="bg-blue-500 p-3 rounded-lg">
//               <Package className="w-6 h-6 text-white" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Total Revenue - Admin Only */}
//         {isAdmin && (
//           <Card className="p-4 bg-white shadow-sm">
//             <CardContent className="flex items-center justify-between p-0">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
//                 <p className="text-2xl font-bold">£150K</p>
//                 <p className="text-sm text-green-600 mt-2">+23% this month</p>
//               </div>
//               <div className="bg-green-500 p-3 rounded-lg">
//                 <DollarSign className="w-6 h-6 text-white" />
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Low Stock */}
//         {lowStockItems.length > 0 && (
//           <Card className="p-4 bg-white shadow-sm border-l-4 border-orange-500">
//             <CardContent className="flex items-center justify-between p-0">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Low Stock</p>
//                 <p className="text-2xl font-bold">{lowStockItems.length}</p>
//                 <Link to="low-stock">
//                   <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
//                     View
//                   </button>
//                 </Link>
//               </div>
//               <div className="bg-orange-500 p-3 rounded-lg">
//                 <AlertTriangle className="w-6 h-6 text-white" />
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Expired Items */}
//         {expiredItems.length > 0 && (
//           <Card className="p-4 bg-white shadow-sm border-l-4 border-yellow-500">
//             <CardContent className="flex items-center justify-between p-0">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Expired Items</p>
//                 <p className="text-2xl font-bold">{expiredItems.length}</p>
//                 <Link to="expired-products">
//                   <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
//                     View
//                   </button>
//                 </Link>
//               </div>
//               <div className="bg-yellow-500 p-3 rounded-lg">
//                 <Clock className="w-6 h-6 text-white" />
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Analytics Section - Admin gets tabs, Users get only Category Distribution */}
//       {isAdmin ? (
//         // Admin View - Full Analytics with Tabs
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="border-b border-gray-200">
//             <nav className="flex gap-8 px-6">
//               {['overview', 'revenue', 'analytics'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
//                     activeTab === tab
//                       ? 'border-teal-600 text-teal-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="p-6">
//             {activeTab === 'overview' && (
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
//                   <div className="h-[300px]">
//                     <Line
//                       data={salesData}
//                       options={{
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: {
//                           legend: {
//                             display: true,
//                           },
//                         },
//                       }}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
//                   <div className="h-[300px] flex items-center justify-center">
//                     <Pie
//                       data={categoryData}
//                       options={{
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: {
//                           legend: {
//                             position: 'bottom',
//                           },
//                         },
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'revenue' && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
//                 <p className="text-3xl font-bold text-teal-600 mb-6">£150,000</p>
//                 <div className="h-[400px]">
//                   <Bar
//                     data={revenueData}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           display: true,
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
//             )}

//             {activeTab === 'analytics' && (
//               <div>
//                 <h3 className="text-lg font-semibold mb-4">Revenue Analysis</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                   <Card className="p-4">
//                     <CardContent className="p-0">
//                       <p className="text-sm text-gray-600 mb-1">Total Sales</p>
//                       <p className="text-2xl font-bold">234</p>
//                       <p className="text-sm text-green-600 mt-1">+18% from last month</p>
//                     </CardContent>
//                   </Card>
//                   <Card className="p-4">
//                     <CardContent className="p-0">
//                       <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
//                       <p className="text-2xl font-bold">£641</p>
//                       <p className="text-sm text-green-600 mt-1">+12% from last month</p>
//                     </CardContent>
//                   </Card>
//                   <Card className="p-4">
//                     <CardContent className="p-0">
//                       <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
//                       <p className="text-2xl font-bold">3.2%</p>
//                       <p className="text-sm text-red-600 mt-1">-2% from last month</p>
//                     </CardContent>
//                   </Card>
//                 </div>
//                 <div className="h-[400px]">
//                   <Bar
//                     data={revenueData}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           display: true,
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         // User View - Only Category Distribution
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
//           <div className="p-6">
//             <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
//             <div className="h-[400px] flex items-center justify-center">
//               <Pie
//                 data={categoryData}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   plugins: {
//                     legend: {
//                       position: 'bottom',
//                     },
//                   },
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;


import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Card, CardContent } from "../components/ui/card";
import { Bell, AlertTriangle, Clock, Package, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { UserContext } from "../context/UserContext";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [stockData, setStockData] = useState({ products: 0 });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ CRITICAL: Redirect admins to admin dashboard
  useEffect(() => {
    console.log("=== Dashboard Component Mounted ===");
    console.log("User:", user);
    console.log("User role:", user?.role);
    console.log("Current path:", window.location.pathname);
    
    if (user && user.role === "Admin") {
      console.log("⚠️ Admin detected on regular dashboard");
      console.log("🔄 Redirecting to /dashboard/admin");
      navigate("/dashboard/admin", { replace: true });
    }
  }, [user, navigate]);

  const isAdmin = user?.role === "Admin";

  // Fallback logic for displayed user name
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const userName =
    user?.name ||
    user?.fullName ||
    storedUser?.name ||
    storedUser?.fullName ||
    localStorage.getItem("username") ||
    "User";

  // Sample data for analytics
  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [4000, 3000, 5000, 4500, 6000, 5500],
        borderColor: "#009688",
        backgroundColor: "rgba(0, 150, 136, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    datasets: [
      {
        label: "Revenue",
        data: [20000, 45000, 30000, 50000, 40000, 60000, 30000, 55000],
        backgroundColor: "#009688",
      },
    ],
  };

  const categoryData = {
    labels: ["Medications", "Consumables", "General", "Apparatus", "Skin Care"],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Inventory
      const inventoryRes = await api.get("/api/items");
      const inventoryData = inventoryRes?.data?.data || [];
      setInventory(inventoryData);
      setStockData({ products: inventoryData.length });

      // Low stock calculation
      const lowStockData = inventoryData.filter((item) => {
        const stock = Number(item.currentQty ?? item.openingQty ?? 0);
        const minStock = Number(item.minStock ?? 0);
        return stock <= minStock;
      });
      setLowStockItems(lowStockData);

      // Expired items
      const expiredRes = await api.get("/api/items/expired");
      const expiredData = expiredRes?.data?.data || [];
      const today = new Date();
      const filteredExpired = expiredData.filter(
        (item) => item.expiryDate && new Date(item.expiryDate) < today
      );
      setExpiredItems(filteredExpired);

      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if not admin (admin will be redirected)
    if (!isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  // ✅ Show loading while redirecting admin
  if (user && user.role === "Admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Redirecting to Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Loading state for data fetch
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-semibold mb-6">
        Hello <span className="font-bold">{userName}!</span>{" "}
        <span className="text-teal-500">Analytics For this week</span>
      </h1>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Products */}
        <Card className="p-4 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-0">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold">{stockData.products}</p>
              <Link to="categories">
                <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
                  View
                </button>
              </Link>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        {lowStockItems.length > 0 && (
          <Card className="p-4 bg-white shadow-sm border-l-4 border-orange-500">
            <CardContent className="flex items-center justify-between p-0">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
                <Link to="low-stock">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
                    View
                  </button>
                </Link>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expired Items */}
        {expiredItems.length > 0 && (
          <Card className="p-4 bg-white shadow-sm border-l-4 border-yellow-500">
            <CardContent className="flex items-center justify-between p-0">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expired Items</p>
                <p className="text-2xl font-bold">{expiredItems.length}</p>
                <Link to="expired-products">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md mt-3 text-sm">
                    View
                  </button>
                </Link>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Analytics Section - Regular Users Only */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <div className="h-[400px] flex items-center justify-center">
            <Pie
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;