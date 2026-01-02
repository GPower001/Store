import { useEffect, useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Download,
  X,
  Search,
  Package,
  AlertCircle,
  FileText,
  BarChart3
} from "lucide-react";
import api from "../../utils/api";

export default function AccountingReport() {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
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
      
      // Extract prices from populated itemId
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
        (m.branchId?.name?.toLowerCase().includes(searchLower))
      );
    }

    setFilteredMovements(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      searchTerm: "",
      branchId: ""
    });
  };

  // Calculate financial metrics
  const additions = filteredMovements.filter(m => m.movementType === "addition");
  const removals = filteredMovements.filter(m => m.movementType === "removal");

  const totalAddedValue = additions.reduce((sum, m) => {
    return sum + ((m.itemPrice || 0) * (m.quantity || 0));
  }, 0);

  const totalRemovedValue = removals.reduce((sum, m) => {
    return sum + ((m.itemPrice || 0) * (m.quantity || 0));
  }, 0);

  const totalAddedQty = additions.reduce((sum, m) => sum + (m.quantity || 0), 0);
  const totalRemovedQty = removals.reduce((sum, m) => sum + (m.quantity || 0), 0);

  const netValue = totalAddedValue - totalRemovedValue;

  // Group by category
  const categoryBreakdown = filteredMovements.reduce((acc, m) => {
    const category = m.itemId?.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = {
        added: 0,
        removed: 0,
        addedQty: 0,
        removedQty: 0
      };
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

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounting-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-teal-600" />
              Accounting Report
            </h1>
            <p className="text-gray-600 mt-2">Financial analysis of inventory movements</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Stock Added Value</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">₦{totalAddedValue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{totalAddedQty} units added</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Stock Removed Value</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">₦{totalRemovedValue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{totalRemovedQty} units removed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Net Value Change</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className={`text-3xl font-bold ${netValue >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {netValue >= 0 ? '+' : ''}₦{netValue.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {netValue >= 0 ? 'Inventory increased' : 'Inventory decreased'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Movements</p>
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{filteredMovements.length}</p>
          <p className="text-xs text-gray-500 mt-1">Transactions recorded</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" />
          Category Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Added Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Added Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Removed Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Removed Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(categoryBreakdown).map(([category, data]) => (
                <tr key={category} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{category}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-semibold">
                    ₦{data.added.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{data.addedQty}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-600 font-semibold">
                    ₦{data.removed.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{data.removedQty}</td>
                  <td className={`px-4 py-3 text-sm text-right font-bold ${
                    (data.added - data.removed) >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    ₦{(data.added - data.removed).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Transactions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Transaction Details
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((m) => {
                  const totalValue = (m.itemPrice || 0) * (m.quantity || 0);
                  return (
                    <tr key={m._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="text-sm text-gray-900">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {m.itemId?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {m.itemId?.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                          m.movementType === "addition" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {m.movementType === "addition" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {m.movementType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {m.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        ₦{(m.itemPrice || 0).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-bold ${
                        m.movementType === "addition" ? "text-green-600" : "text-red-600"
                      }`}>
                        {m.movementType === "addition" ? "+" : "-"}₦{totalValue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {m.branchId?.name || "Unknown"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}