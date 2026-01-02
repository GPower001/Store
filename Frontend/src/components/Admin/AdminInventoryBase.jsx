import { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  AlertTriangle,
  Clock,
  Building2,
  ChevronDown,
  X,
  Save
} from "lucide-react";
import api from "../../utils/api";

/* EXPORT LIBS */
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";
import { saveAs } from "file-saver";

const AdminInventoryBase = ({ category, title, icon: Icon }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchItems(selectedBranch._id);
    }
  }, [selectedBranch, category]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter]);

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/branches");
      let branchesData = [];
      if (Array.isArray(response.data)) branchesData = response.data;
      else if (Array.isArray(response.data?.data)) branchesData = response.data.data;
      else if (Array.isArray(response.data?.branches)) branchesData = response.data.branches;

      setBranches(branchesData);
      if (branchesData.length > 0) setSelectedBranch(branchesData[0]);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    }
  };

  const fetchItems = async (branchId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/branch/${branchId}`);
      const allItems = response.data.data?.items || [];
      setItems(allItems.filter(item => item.category === category));
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const today = new Date();
    if (statusFilter === "low-stock") {
      filtered = filtered.filter(item => item.openingQty <= (item.minStock || 0));
    } else if (statusFilter === "expired") {
      filtered = filtered.filter(item => item.expiryDate && new Date(item.expiryDate) < today);
    } else if (statusFilter === "in-stock") {
      filtered = filtered.filter(item => item.openingQty > (item.minStock || 0));
    }

    setFilteredItems(filtered);
  };

  /* =========================
     EXCEL EXPORT
  ========================= */
  const exportToExcel = () => {
    const data = filteredItems.map(item => ({
      "Item Name": item.name,
      "Item Code": item.itemCode,
      "Stock": item.openingQty,
      "Min Stock": item.minStock || 0,
      "Price": item.price || 0,
      "Status":
        item.expiryDate && new Date(item.expiryDate) < new Date()
          ? "Expired"
          : item.openingQty <= (item.minStock || 0)
          ? "Low Stock"
          : "In Stock",
      "Expiry Date": item.expiryDate
        ? new Date(item.expiryDate).toLocaleDateString()
        : "N/A",
      "Branch": selectedBranch?.name || selectedBranch?.branchName || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    XLSX.writeFile(
      workbook,
      `${title.replace(/\s+/g, "_")}_${selectedBranch?.name || "Branch"}.xlsx`
    );
  };

  /* =========================
     WORD EXPORT
  ========================= */
  const exportToWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          "Item Name",
          "Item Code",
          "Stock",
          "Min Stock",
          "Price",
          "Status",
          "Expiry Date"
        ].map(text =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })]
          })
        )
      }),
      ...filteredItems.map(item =>
        new TableRow({
          children: [
            item.name,
            item.itemCode,
            String(item.openingQty),
            String(item.minStock || 0),
            `₦${item.price?.toFixed(2) || "0.00"}`,
            item.expiryDate && new Date(item.expiryDate) < new Date()
              ? "Expired"
              : item.openingQty <= (item.minStock || 0)
              ? "Low Stock"
              : "In Stock",
            item.expiryDate
              ? new Date(item.expiryDate).toLocaleDateString()
              : "N/A"
          ].map(text =>
            new TableCell({
              children: [new Paragraph(text)]
            })
          )
        })
      )
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${title} Inventory`,
                  bold: true,
                  size: 28
                })
              ]
            }),
            new Paragraph({
              text: `Branch: ${selectedBranch?.name || selectedBranch?.branchName || ""}`
            }),
            new Paragraph({ text: "" }),
            new Table({ rows: tableRows })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(
      blob,
      `${title.replace(/\s+/g, "_")}_${selectedBranch?.name || "Branch"}.docx`
    );
  };

  const handleEdit = (item) => {
    setOriginalItem({ ...item });
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const branchIdHeader = selectedBranch?._id;
      if (!branchIdHeader || branchIdHeader === 'null' || branchIdHeader === 'undefined') {
        alert("Invalid branch selected. Please select a valid branch.");
        return;
      }

      await api.delete(`/api/items/${itemToDelete._id}`, {
        headers: { 'x-branch-id': branchIdHeader }
      });

      setItems(items.filter(item => item._id !== itemToDelete._id));
      setShowDeleteModal(false);
      setItemToDelete(null);
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert(error.response?.data?.message || "Failed to delete item");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {};
      if (editingItem.name !== originalItem.name) payload.name = editingItem.name;
      if (editingItem.itemCode !== originalItem.itemCode) payload.itemCode = editingItem.itemCode;
      if (parseFloat(editingItem.price) !== parseFloat(originalItem.price)) payload.price = parseFloat(editingItem.price) || 0;
      if (parseInt(editingItem.minStock) !== parseInt(originalItem.minStock)) payload.minStock = parseInt(editingItem.minStock) || 0;
      const newQty = parseInt(editingItem.openingQty) || 0;
      const oldQty = parseInt(originalItem.openingQty) || 0;
      if (newQty !== oldQty) payload.additionalStock = newQty - oldQty;
      const newExpiry = editingItem.expiryDate ? new Date(editingItem.expiryDate).toISOString().split('T')[0] : null;
      const oldExpiry = originalItem.expiryDate ? new Date(originalItem.expiryDate).toISOString().split('T')[0] : null;
      if (newExpiry !== oldExpiry) payload.expiryDate = editingItem.expiryDate || null;

      if (Object.keys(payload).length === 0) {
        alert("No changes detected");
        return;
      }

      const branchIdHeader = selectedBranch?._id;
      if (!branchIdHeader || branchIdHeader === 'null' || branchIdHeader === 'undefined' || branchIdHeader === null || branchIdHeader === undefined) {
        alert("Invalid branch selected. Please select a valid branch.");
        return;
      }

      const response = await api.put(`/api/items/${editingItem._id}`, payload, {
        headers: { 'x-branch-id': String(branchIdHeader) }
      });

      setItems(items.map(item =>
        item._id === editingItem._id ? response.data.data : item
      ));

      setShowEditModal(false);
      setEditingItem(null);
      setOriginalItem(null);
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      alert(error.response?.data?.message || "Failed to update item");
    }
  };

  const getStatusBadge = (item) => {
    const today = new Date();
    const isExpired = item.expiryDate && new Date(item.expiryDate) < today;
    const isLowStock = item.openingQty <= (item.minStock || 0);

    if (isExpired) return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        <Clock className="w-3 h-3" />
        Expired
      </span>
    );
    if (isLowStock) return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
        <AlertTriangle className="w-3 h-3" />
        Low Stock
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
        <Package className="w-3 h-3" />
        In Stock
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Icon className="w-8 h-8 text-teal-600" />
            {title}
          </h1>
          <p className="text-gray-600 mt-2">
            Manage {category.toLowerCase()} items across all branches
          </p>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Export Excel
          </button>
          <button
            onClick={exportToWord}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Export Word
          </button>
        </div>
      </div>

      {/* BRANCH SELECTOR */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Select Branch</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {branches.map((branch) => (
            <button
              key={branch._id}
              onClick={() => setSelectedBranch(branch)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedBranch?._id === branch._id
                  ? "border-teal-600 bg-teal-50"
                  : "border-gray-200 hover:border-teal-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className={`w-5 h-5 ${
                  selectedBranch?._id === branch._id ? "text-teal-600" : "text-gray-400"
                }`} />
                <div className="text-left">
                  <p className={`font-semibold ${
                    selectedBranch?._id === branch._id ? "text-teal-900" : "text-gray-900"
                  }`}>
                    {branch.name || branch.branchName}
                  </p>
                  <p className="text-xs text-gray-500">{branch.location}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            <Package className="w-10 h-10 text-teal-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => item.openingQty <= (item.minStock || 0)).length}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter(item => {
                  const today = new Date();
                  return item.expiryDate && new Date(item.expiryDate) < today;
                }).length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border-b">Name</th>
                  <th className="px-4 py-2 border-b">Code</th>
                  <th className="px-4 py-2 border-b">Stock</th>
                  <th className="px-4 py-2 border-b">Min Stock</th>
                  <th className="px-4 py-2 border-b">Price</th>
                  <th className="px-4 py-2 border-b">Status</th>
                  <th className="px-4 py-2 border-b">Expiry</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{item.name}</td>
                    <td className="px-4 py-2 border-b">{item.itemCode}</td>
                    <td className="px-4 py-2 border-b">{item.openingQty}</td>
                    <td className="px-4 py-2 border-b">{item.minStock || 0}</td>
                    <td className="px-4 py-2 border-b">₦{item.price?.toFixed(2) || "0.00"}</td>
                    <td className="px-4 py-2 border-b">{getStatusBadge(item)}</td>
                    <td className="px-4 py-2 border-b">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-2 border-b flex gap-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Item</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Code"
                value={editingItem.itemCode}
                onChange={(e) => setEditingItem({ ...editingItem, itemCode: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Stock"
                value={editingItem.openingQty}
                onChange={(e) => setEditingItem({ ...editingItem, openingQty: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Min Stock"
                value={editingItem.minStock}
                onChange={(e) => setEditingItem({ ...editingItem, minStock: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Price"
                value={editingItem.price}
                onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="date"
                placeholder="Expiry"
                value={editingItem.expiryDate ? new Date(editingItem.expiryDate).toISOString().split('T')[0] : ""}
                onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                className="border p-2 rounded"
              />
            </div>
            <button
              onClick={handleSaveEdit}
              className="mt-4 w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
            >
              <Save className="inline w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 relative">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInventoryBase;