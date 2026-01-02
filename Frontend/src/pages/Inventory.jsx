import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Plus,
  ChevronDown,
  Filter,
  ArrowUpRight,
  Sliders,
  Funnel,
  ArrowDown,
} from "lucide-react";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/items`);
        setItems(response.data.data || []);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Navigate to add-item page
  const handleAddItem = () => {
    navigate("/dashboard/add-item");
  };

  const filteredItems = items.filter(
    (item) => item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <p className="text-center py-12 text-gray-600 font-semibold">Loading...</p>
    );
  if (error)
    return (
      <p className="text-center py-12 text-red-500 font-semibold">{error}</p>
    );

  return (
    <div>
      {/* Top Navigation */}
      <div className="bg-teal-900 p-4 rounded-tl-3xl rounded-tr-3xl flex items-center justify-between">
        <div className="flex space-x-12 text-gray-300 font-semibold text-lg">
          <span>STOCK</span>
          <span>CATEGORY</span>
          <span>ADD IMAGE</span>
        </div>

        {/* Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {/* Left Section (Item List) */}
        <div className="w-1/2 px-4">
          {/* Add Item Button */}
          <button
            onClick={handleAddItem}
            className="flex items-center bg-teal-500 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:bg-teal-600 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Item
            <ChevronDown className="w-5 h-5 ml-2" />
          </button>

          {/* Item Table */}
          <div className="mt-4 overflow-x-auto rounded-lg shadow">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-teal-900 font-semibold">
                  <th className="px-4 py-2 flex items-center">
                    Item <Filter className="ml-2 w-4 h-4" />
                  </th>
                  <th className="px-4 py-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item._id || item.id}
                      className={`cursor-pointer ${
                        selectedItem?.id === item.id || selectedItem?._id === item._id
                          ? "bg-teal-700 text-white"
                          : "bg-white text-black"
                      } hover:bg-teal-500 transition`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.openingQty || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4 text-gray-500">
                      No matching items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section (Item Details) */}
        <div className="w-1/2 px-8 border-l h-[90vh] overflow-y-auto">
          {selectedItem ? (
            <>
              {/* Selected Item Info */}
              <div className="bg-gray-600 text-white p-6 rounded-xl shadow-lg flex justify-between items-center mb-6">
                <div>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    {selectedItem.name} <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div className="mt-2 text-sm">
                    <p>
                      SALE PRICE: <span className="text-gray-300">₦{selectedItem.salePrice}</span>
                    </p>
                    <p>
                      PURCHASE PRICE: <span className="text-gray-300">₦{selectedItem.purchasePrice}</span>
                    </p>
                  </div>
                </div>
                <button className="flex items-center bg-teal-500 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:bg-teal-600 transition">
                  <Sliders className="w-5 h-5 mr-2" />
                  Adjust Item
                </button>
              </div>

              {/* Transaction History */}
              <div className="bg-gray-600 text-white p-6 rounded-xl shadow-lg w-full">
                <div className="grid grid-cols-6 gap-2 border-b border-white pb-2 text-sm font-semibold">
                  <div className="flex items-center gap-1">
                    TYPE <Funnel className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    INVOICE <Funnel className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    NAME <Funnel className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    DATE <ArrowDown className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    QUANTITY <Funnel className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    STATUS <Funnel className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-6 items-center pt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-900 rounded-full"></span>
                    ADD IMAGE
                  </div>
                  <div></div>
                  <div></div>
                  <div>22/02/2025</div>
                  <div>{selectedItem.openingQty || 0} QT</div>
                  <div>SUCCESSFUL</div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 mt-12 text-center">Select an item to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
