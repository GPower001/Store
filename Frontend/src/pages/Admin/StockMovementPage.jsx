import { useEffect, useState } from "react";
import { 
  ArrowDownUp, 
  Calendar, 
  Filter, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  X, 
  Search,
  Download,
  BarChart3,
  FileText,
  AlertCircle
} from "lucide-react";
import api from "../../utils/api";

export default function StockMovementReport() {
  const [activeTab, setActiveTab] = useState("movements");
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    movementType: "all",
    startDate: "",
    endDate: "",
    searchTerm: "",
    branchId: ""
  });
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchBranches();
    fetchMovements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/branches");
      let branchesData = [];
      if (Array.isArray(response.data)) branchesData = response.data;
      else if (Array.isArray(response.data?.data)) branchesData = response.data.data;
      else if (Array.isArray(response.data?.branches)) branchesData = response.data.branches;
      setBranches(branchesData);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/stock-movements");
      const movementsData = response.data.data || [];
      
      const movementsWithPrices = movementsData.map(movement => ({
        ...movement,
        itemPrice: movement.itemId?.price || 0
      }));
      
      setMovements(movementsWithPrices);
    } catch (err) {
      console.error("Failed to fetch movements:", err);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    if (filters.movementType !== "all") {
      filtered = filtered.filter(m => m.movementType === filters.movementType);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(m => new Date(m.createdAt) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.createdAt) <= endDate);
    }

    if (filters.branchId) {
      filtered = filtered.filter(m => m.branchId?._id === filters.branchId);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        (m.itemId?.name?.toLowerCase().includes(searchLower)) ||
        (m.branchId?.name?.toLowerCase().includes(searchLower)) ||
        (m.reason?.toLowerCase().includes(searchLower))
      );
    }

    setFilteredMovements(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      movementType: "all",
      startDate: "",
      endDate: "",
      searchTerm: "",
      branchId: ""
    });
  };

  const getMovementIcon = (type) => {
    switch(type) {
      case "addition": return <TrendingUp className="w-4 h-4" />;
      case "removal": return <TrendingDown className="w-4 h-4" />;
      case "adjustment": return <RefreshCw className="w-4 h-4" />;
      default: return <ArrowDownUp className="w-4 h-4" />;
    }
  };

  const getMovementColor = (type) => {
    switch(type) {
      case "addition": return "bg-green-100 text-green-800 border-green-300";
      case "removal": return "bg-red-100 text-red-800 border-red-300";
      case "adjustment": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const additions = filteredMovements.filter(m => m.movementType === "addition");
  const removals = filteredMovements.filter(m => m.movementType === "removal");
  const adjustments = filteredMovements.filter(m => m.movementType === "adjustment");

  const totalAddedQty = additions.reduce((sum, m) => sum + (m.quantity || 0), 0);
  const totalRemovedQty = removals.reduce((sum, m) => sum + (m.quantity || 0), 0);

  // Financial calculations
  const totalAddedValue = additions.reduce((sum, m) => sum + ((m.itemPrice || 0) * (m.quantity || 0)), 0);
  const totalRemovedValue = removals.reduce((sum, m) => sum + ((m.itemPrice || 0) * (m.quantity || 0)), 0);
  const netValue = totalAddedValue - totalRemovedValue;

  const categoryBreakdown = filteredMovements.reduce((acc, m) => {
    const category = m.itemId?.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { added: 0, removed: 0, addedQty: 0, removedQty: 0 };
    }
    const value = (m.itemPrice || 0) * (m.quantity || 0);
    if (m.movementType === "addition") {
      acc[category].added += value;
      acc[category].addedQty += m.quantity || 0;
    } else if (m.movementType === "removal") {
      acc[category].removed += value;
      acc[category].removedQty += m.quantity || 0;
    }
    return acc;
  }, {});

  const exportToCSV = () => {
    const headers = ["Date", "Item", "Category", "Type", "Quantity", "Unit Price", "Total Value", "Branch"];
    const rows = filteredMovements.map(m => [
      new Date(m.createdAt).toLocaleDateString(),
      m.itemId?.name || "Unknown",
      m.itemId?.category || "N/A",
      m.movementType,
      m.quantity,
      `₦${(m.itemPrice || 0).toFixed(2)}`,
      `₦${((m.itemPrice || 0) * (m.quantity || 0)).toFixed(2)}`,
      m.branchId?.name || "Unknown"
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-teal-600" />
              Inventory Reports
            </h1>
            <p className="text-gray-600 mt-2">Track stock movements and financial analytics</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            {activeTab === "accounting" && (
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("movements")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "movements"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ArrowDownUp className="w-5 h-5" />
            Stock Movements
          </button>
          <button
            onClick={() => setActiveTab("accounting")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === "accounting"
                ? "border-b-2 border-teal-600 text-teal-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Accounting
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  placeholder="Item or branch..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.movementType}
                onChange={(e) => handleFilterChange("movementType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="addition">Addition</option>
                <option value="removal">Removal</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                value={filters.branchId}
                onChange={(e) => handleFilterChange("branchId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name || branch.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {activeTab === "movements" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Movements</p>
                  <p className="text-3xl font-bold text-gray-900">{filteredMovements.length}</p>
                </div>
                <Package className="w-10 h-10 text-teal-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Additions</p>
                  <p className="text-3xl font-bold text-green-600">{additions.length}</p>
                  <p className="text-xs text-gray-500 mt-1">+{totalAddedQty} units</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Removals</p>
                  <p className="text-3xl font-bold text-red-600">{removals.length}</p>
                  <p className="text-xs text-gray-500 mt-1">-{totalRemovedQty} units</p>
                </div>
                <TrendingDown className="w-10 h-10 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Adjustments</p>
                  <p className="text-3xl font-bold text-yellow-600">{adjustments.length}</p>
                </div>
                <RefreshCw className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Movement History</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-12">
                <ArrowDownUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No stock movements found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMovements.map((m) => (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {m.itemId?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getMovementColor(m.movementType)}`}>
                            {getMovementIcon(m.movementType)}
                            {m.movementType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{m.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{m.previousQuantity}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{m.newQuantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{m.userId?.name || "Unknown"}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{m.branchId?.name || "Unknown"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "accounting" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Stock Added Value</p>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">₦{totalAddedValue.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs text-gray-500 mt-1">{totalAddedQty} units</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Stock Removed Value</p>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-red-600">₦{totalRemovedValue.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs text-gray-500 mt-1">{totalRemovedQty} units</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Net Value Change</p>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <p className={`text-3xl font-bold ${netValue >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {netValue >= 0 ? '+' : ''}₦{Math.abs(netValue).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Movements</p>
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{filteredMovements.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                Category Breakdown
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Added Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Removed Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(categoryBreakdown).map(([category, data]) => (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category}</td>
                      <td className="px-6 py-4 text-right text-sm text-green-600 font-semibold">₦{data.added.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right text-sm text-red-600 font-semibold">₦{data.removed.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className={`px-6 py-4 text-right text-sm font-bold ${(data.added - data.removed) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        ₦{(data.added - data.removed).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Transaction Details
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMovements.map(m => (
                    <tr key={m._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{m.itemId?.name || "Unknown"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getMovementColor(m.movementType)}`}>
                          {getMovementIcon(m.movementType)}
                          {m.movementType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{m.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">₦{(m.itemPrice || 0).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className={`px-6 py-4 text-right text-sm font-bold ${m.movementType === "addition" ? "text-green-600" : "text-red-600"}`}>
                        {m.movementType === "addition" ? "+" : "-"}₦{((m.itemPrice || 0) * (m.quantity || 0)).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}