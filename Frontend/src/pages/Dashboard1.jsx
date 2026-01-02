// import React, { useState } from 'react';
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { Package, TrendingUp, AlertTriangle, DollarSign, Search, Filter, Plus, Download, LayoutDashboard, ShoppingCart, Users, Settings, FileText, Bell, Menu, X, LogOut, ChevronDown, GitBranch } from 'lucide-react';

// const InventoryDashboard = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [activeMenu, setActiveMenu] = useState('dashboard');
//   const [showBranchModal, setShowBranchModal] = useState(false);
//   const [newBranch, setNewBranch] = useState({ name: '', location: '', manager: '' });

//   // Sample data
//   const inventoryData = [
//     { id: 1, name: 'Laptop Pro 15"', sku: 'LAP-001', category: 'Electronics', stock: 45, price: 1299, status: 'In Stock' },
//     { id: 2, name: 'Office Chair Ergonomic', sku: 'FUR-002', category: 'Furniture', stock: 8, price: 349, status: 'Low Stock' },
//     { id: 3, name: 'Wireless Mouse', sku: 'ACC-003', category: 'Accessories', stock: 0, price: 29, status: 'Out of Stock' },
//     { id: 4, name: 'USB-C Cable 6ft', sku: 'ACC-004', category: 'Accessories', stock: 150, price: 15, status: 'In Stock' },
//     { id: 5, name: 'Monitor 27" 4K', sku: 'ELC-005', category: 'Electronics', stock: 22, price: 599, status: 'In Stock' },
//     { id: 6, name: 'Standing Desk', sku: 'FUR-006', category: 'Furniture', stock: 5, price: 899, status: 'Low Stock' },
//   ];

//   const salesData = [
//     { month: 'Jan', sales: 4000, revenue: 52000 },
//     { month: 'Feb', sales: 3000, revenue: 45000 },
//     { month: 'Mar', sales: 5000, revenue: 68000 },
//     { month: 'Apr', sales: 4500, revenue: 61000 },
//     { month: 'May', sales: 6000, revenue: 79000 },
//     { month: 'Jun', sales: 5500, revenue: 73000 },
//   ];

//   const categoryData = [
//     { name: 'Electronics', value: 45, color: '#3b82f6' },
//     { name: 'Furniture', value: 25, color: '#8b5cf6' },
//     { name: 'Accessories', value: 30, color: '#10b981' },
//   ];

//   const stats = [
//     { title: 'Total Products', value: '156', change: '+12%', icon: Package, color: 'bg-blue-500' },
//     { title: 'Total Revenue', value: '$378K', change: '+23%', icon: DollarSign, color: 'bg-green-500' },
//     { title: 'Low Stock Items', value: '8', change: '-5%', icon: AlertTriangle, color: 'bg-orange-500' },
//     { title: 'Sales This Month', value: '234', change: '+18%', icon: TrendingUp, color: 'bg-purple-500' },
//   ];

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
//     { id: 'products', label: 'Products', icon: Package },
//     { id: 'branches', label: 'Branches', icon: GitBranch },
//     { id: 'orders', label: 'Orders', icon: ShoppingCart },
//     { id: 'customers', label: 'Customers', icon: Users },
//     { id: 'reports', label: 'Reports', icon: FileText },
//     { id: 'settings', label: 'Settings', icon: Settings },
//   ];

//   const filteredInventory = inventoryData.filter(item =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.sku.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'In Stock': return 'bg-green-100 text-green-800';
//       case 'Low Stock': return 'bg-orange-100 text-orange-800';
//       case 'Out of Stock': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const handleCreateBranch = () => {
//     // Handle branch creation logic here
//     console.log('Creating branch:', newBranch);
//     setShowBranchModal(false);
//     setNewBranch({ name: '', location: '', manager: '' });
//   };

//   return (
//     <div className="flex h-screen bg-gray-50 overflow-hidden">
//       {/* Sidebar */}
//       <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
//         {/* Logo */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-800">
//           {sidebarOpen && <span className="text-xl font-bold">InventoryHub</span>}
//           <button 
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-2 rounded-lg hover:bg-gray-800"
//           >
//             {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-2">
//           {menuItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveMenu(item.id)}
//               className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${
//                 activeMenu === item.id
//                   ? 'bg-blue-600 text-white'
//                   : 'text-gray-300 hover:bg-gray-800'
//               }`}
//             >
//               <item.icon className="w-5 h-5 flex-shrink-0" />
//               {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
//             </button>
//           ))}
//         </nav>

//         {/* User Profile */}
//         <div className="p-4 border-t border-gray-800">
//           <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
//             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
//               <span className="text-sm font-semibold">AD</span>
//             </div>
//             {sidebarOpen && (
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-medium truncate">Admin User</p>
//                 <p className="text-xs text-gray-400 truncate">admin@company.com</p>
//               </div>
//             )}
//           </div>
//           {sidebarOpen && (
//             <button className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg">
//               <LogOut className="w-4 h-4" />
//               Logout
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="bg-white shadow-sm border-b">
//           <div className="px-6 py-4 flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
//               <p className="text-sm text-gray-500 mt-1">Manage your products and track performance</p>
//             </div>
//             <div className="flex items-center gap-4">
//               <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
//                 <Bell className="w-5 h-5" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//               </button>
//               <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
//                 <Plus className="w-4 h-4" />
//                 Add Product
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-6">
//             {/* Stats Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {stats.map((stat, idx) => (
//                 <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
//                       <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//                       <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
//                     </div>
//                     <div className={`${stat.color} p-3 rounded-lg`}>
//                       <stat.icon className="w-6 h-6 text-white" />
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Tabs */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
//               <div className="border-b border-gray-200">
//                 <nav className="flex gap-8 px-6">
//                   {['overview', 'inventory', 'analytics'].map(tab => (
//                     <button
//                       key={tab}
//                       onClick={() => setActiveTab(tab)}
//                       className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
//                         activeTab === tab
//                           ? 'border-blue-600 text-blue-600'
//                           : 'border-transparent text-gray-500 hover:text-gray-700'
//                       }`}
//                     >
//                       {tab}
//                     </button>
//                   ))}
//                 </nav>
//               </div>

//               <div className="p-6">
//                 {activeTab === 'overview' && (
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
//                       <ResponsiveContainer width="100%" height={300}>
//                         <LineChart data={salesData}>
//                           <CartesianGrid strokeDasharray="3 3" />
//                           <XAxis dataKey="month" />
//                           <YAxis />
//                           <Tooltip />
//                           <Legend />
//                           <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
//                         </LineChart>
//                       </ResponsiveContainer>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
//                       <ResponsiveContainer width="100%" height={300}>
//                         <PieChart>
//                           <Pie
//                             data={categoryData}
//                             cx="50%"
//                             cy="50%"
//                             labelLine={false}
//                             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                             outerRadius={100}
//                             fill="#8884d8"
//                             dataKey="value"
//                           >
//                             {categoryData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={entry.color} />
//                             ))}
//                           </Pie>
//                           <Tooltip />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === 'inventory' && (
//                   <div>
//                     <div className="flex gap-4 mb-6">
//                       <div className="flex-1 relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                         <input
//                           type="text"
//                           placeholder="Search products..."
//                           value={searchTerm}
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </div>
//                       <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
//                         <Filter className="w-4 h-4" />
//                         Filter
//                       </button>
//                       <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
//                         <Download className="w-4 h-4" />
//                         Export
//                       </button>
//                     </div>

//                     <div className="overflow-x-auto">
//                       <table className="w-full">
//                         <thead>
//                           <tr className="bg-gray-50 border-b border-gray-200">
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {filteredInventory.map((item) => (
//                             <tr key={item.id} className="hover:bg-gray-50">
//                               <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.name}</td>
//                               <td className="px-4 py-4 text-sm text-gray-500">{item.sku}</td>
//                               <td className="px-4 py-4 text-sm text-gray-500">{item.category}</td>
//                               <td className="px-4 py-4 text-sm text-gray-900">{item.stock}</td>
//                               <td className="px-4 py-4 text-sm text-gray-900">${item.price}</td>
//                               <td className="px-4 py-4">
//                                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
//                                   {item.status}
//                                 </span>
//                               </td>
//                               <td className="px-4 py-4 text-sm">
//                                 <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
//                                 <button className="text-red-600 hover:text-red-800">Delete</button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === 'analytics' && (
//                   <div>
//                     <h3 className="text-lg font-semibold mb-4">Revenue Analysis</h3>
//                     <ResponsiveContainer width="100%" height={400}>
//                       <BarChart data={salesData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="month" />
//                         <YAxis />
//                         <Tooltip />
//                         <Legend />
//                         <Bar dataKey="revenue" fill="#3b82f6" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InventoryDashboard;