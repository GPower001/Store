

import React, { useState, useEffect } from "react";
import StockTable from "../components/StockTable";
import api from "../utils/api"; // ✅ secured axios instance
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFileWord } from "react-icons/fa";

const PAGE_SIZE = 50;

const ExpiredItemsPage = () => {
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  // Fetch all expired items
  const fetchExpiredItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/items/expired");
      const data = res?.data?.data || res?.data || [];
      const today = new Date();

      const expired = (data.items || data).filter(
        (item) =>
          item.expiryDate &&
          new Date(item.expiryDate).setHours(0, 0, 0, 0) <
            today.setHours(0, 0, 0, 0)
      );

      setExpiredItems(expired);
      setError(null);
    } catch (err) {
      console.error("Error fetching expired items:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch expired items. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiredItems();
  }, []);

  // Search filter
  const filteredItems = expiredItems.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const indexOfLastItem = currentPage * PAGE_SIZE;
  const indexOfFirstItem = indexOfLastItem - PAGE_SIZE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination handler
  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === "prev") return Math.max(1, prev - 1);
      if (direction === "next") return Math.min(totalPages, prev + 1);
      return prev;
    });
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Optional: Delete item locally
  const handleItemDelete = (itemId) => {
    setExpiredItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      expiredItems.map((item, idx) => ({
        "#": idx + 1,
        Name: item.name,
        Category: item.category,
        Stock: item.openingQty,
        "Expiry Date": item.expiryDate
          ? new Date(item.expiryDate).toLocaleDateString()
          : "N/A",
        "Item Code": item.itemCode,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expired Items");
    XLSX.writeFile(workbook, "expired_items.xlsx");
  };

  // Export to Word
  const handleExportWord = () => {
    let html =
      `<h2>Expired Products</h2>` +
      `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;">` +
      `<tr>
        <th>#</th>
        <th>Name</th>
        <th>Category</th>
        <th>Stock</th>
        <th>Expiry Date</th>
        <th>Item Code</th>
      </tr>`;

    expiredItems.forEach((item, idx) => {
      html += `<tr>
        <td>${idx + 1}</td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.openingQty}</td>
        <td>${
          item.expiryDate
            ? new Date(item.expiryDate).toLocaleDateString()
            : "N/A"
        }</td>
        <td>${item.itemCode}</td>
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
    saveAs(blob, "expired_items.doc");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Expired Items</h1>

      {/* Export buttons */}
      <div className="flex justify-end gap-2 mb-4">
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

      {/* Search */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search item name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Table */}
      <StockTable items={currentItems} onItemDelete={handleItemDelete} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
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
  );
};

export default ExpiredItemsPage;

