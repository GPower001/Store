import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from "docx";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFileWord } from "react-icons/fa";
import api from "../utils/api"; // ✅ secured axios instance
const ITEMS_PER_PAGE = 50;

const ItemCategoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Medications");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/items");
        setProducts(response.data.data || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Stock status helper
  const getStockStatus = (product) => {
    const stock = Number(product.openingQty ?? 0);
    const minStock = Number(product.minStock ?? 0);
    if (stock === 0) return "Out of Stock";
    if (stock <= minStock) return "Low Stock";
    return "In Stock";
  };

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    acc[category] = acc[category] || [];
    acc[category].push(product);
    return acc;
  }, {});

  const filteredProducts =
    groupedProducts[activeCategory]?.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => setCurrentPage(1), [search, activeCategory]);

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === "prev") return Math.max(1, prev - 1);
      if (direction === "next") return Math.min(totalPages, prev + 1);
      return prev;
    });
  };

  const exportToExcel = () => {
    const data = filteredProducts.map((product) => ({
      "Item Name": product.name,
      Stock: product.openingQty,
      "Minimum Stock": product.minStock,
      Status: getStockStatus(product),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeCategory);
    XLSX.writeFile(workbook, `${activeCategory}_Products.xlsx`);
  };

  const exportToWord = () => {
    const rows = [
      new TableRow({
        children: ["Item Name", "Stock", "Minimum Stock", "Status"].map(
          (h) => new TableCell({ children: [new Paragraph(h)] })
        ),
      }),
      ...filteredProducts.map((p) =>
        new TableRow({
          children: [
            p.name,
            p.openingQty.toString(),
            p.minStock.toString(),
            getStockStatus(p),
          ].map((t) => new TableCell({ children: [new Paragraph(t)] }))
        })
      ),
    ];

    const table = new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [{ children: [new Paragraph(`${activeCategory} Products`), table] }],
    });

    Packer.toBlob(doc).then((blob) => saveAs(blob, `${activeCategory}_Products.docx`));
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

  const categories = Object.keys(groupedProducts);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Products by Category</h1>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-md font-medium ${
              activeCategory === category
                ? "bg-teal-500 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-teal-600 hover:text-white`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search & Export */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search item name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 hover:scale-105 transition-transform"
          >
            <FaFileExcel size={18} />
          </button>
          <button
            onClick={exportToWord}
            className="flex items-center justify-center bg-teal-500 text-white p-3 rounded-full shadow-lg hover:bg-teal-600 hover:scale-105 transition-transform"
          >
            <FaFileWord size={18} />
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {["Item Name", "Stock", "Minimum Stock", "Status"].map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product, idx) => {
              const status = getStockStatus(product);
              return (
                <tr
                  key={product._id}
                  className={`hover:bg-gray-100 transition ${
                    idx % 2 !== 0 ? "bg-gray-50" : "bg-white"
                  } ${
                    status === "Low Stock" ? "bg-yellow-50" : ""
                  } ${status === "Out of Stock" ? "bg-red-50" : ""}`}
                >
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{product.name}</td>
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{product.openingQty}</td>
                  <td className="border border-gray-300 px-6 py-4 text-sm text-gray-800">{product.minStock}</td>
                  <td className={`border border-gray-300 px-6 py-4 text-sm ${
                    status === "Low Stock" ? "text-orange-500" :
                    status === "Out of Stock" ? "text-red-500" : "text-green-500"
                  }`}>
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemCategoryPage;
