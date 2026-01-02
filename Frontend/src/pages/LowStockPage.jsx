import React, { useEffect, useState } from "react";
import api from "../utils/api"; // secured axios instance
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFileWord } from "react-icons/fa";

const ITEMS_PER_PAGE = 50;

const LowStockItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        // Fetch all items
        const response = await api.get("/api/items");
        const allItems = response?.data?.data || [];

        // Calculate low stock items locally
        const lowStockItems = allItems.filter(item => {
          const stock = Number(item.openingQty ?? 0);
          const minStock = Number(item.minStock ?? 0);
          return stock <= minStock;
        });

        setItems(lowStockItems);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch low stock items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Filter by search term
  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = direction => {
    setCurrentPage(prev => {
      if (direction === "prev") return Math.max(1, prev - 1);
      if (direction === "next") return Math.min(totalPages, prev + 1);
      return prev;
    });
  };

  useEffect(() => setCurrentPage(1), [search]);

  const fetchAllItems = async () => {
    try {
      const response = await api.get("/api/items");
      const allItems = response?.data?.data || [];
      return allItems.filter(item => {
        const stock = Number(item.openingQty ?? 0);
        const minStock = Number(item.minStock ?? 0);
        return stock <= minStock;
      });
    } catch {
      return [];
    }
  };

  const handleExportExcel = async () => {
    const allItems = await fetchAllItems();
    const worksheet = XLSX.utils.json_to_sheet(
      allItems.map((item, idx) => ({
        "#": idx + 1,
        Name: item.name,
        Category: item.category,
        Stock: item.openingQty,
        "Minimum Stock": item.minStock,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Low Stock Items");
    XLSX.writeFile(workbook, "low_stock_items.xlsx");
  };

  const handleExportWord = async () => {
    const allItems = await fetchAllItems();
    let html = `<h2>Low Stock Items</h2>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Category</th>
          <th>Stock</th>
          <th>Minimum Stock</th>
        </tr>`;
    allItems.forEach((item, idx) => {
      html += `<tr>
        <td>${idx + 1}</td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.openingQty}</td>
        <td>${item.minStock}</td>
      </tr>`;
    });
    html += `</table>`;

    const blob = new Blob(
      [
        `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'></head><body>${html}</body></html>`,
      ],
      { type: "application/msword;charset=utf-8" }
    );
    saveAs(blob, "low_stock_items.doc");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Low Stock Items</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 hover:scale-105 transition-transform"
          >
            <FaFileExcel size={18} />
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center justify-center bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 hover:scale-105 transition-transform"
          >
            <FaFileWord size={18} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search item name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {currentItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200 shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">#</th>
                <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">Item Name</th>
                <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">Minimum Stock</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => (
                <tr key={item._id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}>
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{item.name}</td>
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{item.category}</td>
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{item.openingQty}</td>
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{item.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => handlePageChange("next")}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-10 text-lg font-medium text-gray-600">No items are low in stock.</div>
      )}
    </div>
  );
};

export default LowStockItems;
