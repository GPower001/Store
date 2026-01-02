// import React, { useState, useEffect } from "react";
// import AdjustStockModal from "../components/AdjustStockModal";
// import UpdateThresholdModal from "../components/UpdateThresholdModal"
// import { Search } from "lucide-react";
// import api from "../utils/api"; // ✅ secured axios

// const AdjustStockPage = () => {
//   const [thresholdItem, setThresholdItem] = useState(null);
//   const [items, setItems] = useState([]);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 4;

//   useEffect(() => {
//     const fetchItems = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get("/api/items");
//         const responseData = Array.isArray(response.data.data) ? response.data.data : [];
//         setItems(responseData);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching items:", err);
//         setError(
//           err.response?.data?.message ||
//             "Failed to fetch items. Please try again later."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchItems();
//   }, []);

//   // 🔍 Filter items by name or itemName
//   const filteredItems = items.filter(
//     (item) =>
//       item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // 📄 Pagination logic
//   const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (direction) => {
//     setCurrentPage((prev) => {
//       if (direction === "prev") return Math.max(1, prev - 1);
//       if (direction === "next") return Math.min(totalPages, prev + 1);
//       return prev;
//     });
//   };

//   const handleStockUpdate = (updatedItem) => {
//     setItems((prevItems) =>
//       prevItems.map((item) => (item._id === updatedItem._id ? updatedItem : item))
//     );
//     setSelectedItem(null);
//   };

//   // Reset page when search changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
//         <p className="text-sm text-red-700">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Adjust Stock Levels</h1>
//         <div className="relative w-64">
//           <Search
//             className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//             size={18}
//           />
//           <input
//             type="text"
//             placeholder="Search items..."
//             className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* 📋 Table */}
//       <div className="bg-white shadow-sm rounded-lg overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Item Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Current Stock
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {currentItems.length > 0 ? (
//               currentItems.map((item) => (
//                 <tr key={item._id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
//                     {item.name || item.itemName}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{item.openingQty ?? 0}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{item.minStock ?? 0}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.openingQty === 0 ? (
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         Out of Stock
//                       </span>
//                     ) : item.openingQty <= item.minStock ? (
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         Low Stock
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                         In Stock
//                       </span>
//                     )}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap flex gap-4">
//                     <button
//                       onClick={() => setSelectedItem(item)}
//                       className="text-blue-600 hover:text-blue-800 font-medium"
//                     >
//                       Adjust Stock
//                     </button>

//                     <button
//                       onClick={() => setThresholdItem(item)}
//                       className="text-teal-600 hover:text-teal-800 font-medium"
//                     >
//                       Edit Minimum Stock
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
//                   No items available
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* 📄 Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center items-center gap-2 mt-6">
//           <button
//             className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
//             onClick={() => handlePageChange("prev")}
//             disabled={currentPage === 1}
//           >
//             Prev
//           </button>
//           <span>
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
//             onClick={() => handlePageChange("next")}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {/* 🔧 Adjust Stock Modal */}
//       {selectedItem && (
//         <AdjustStockModal
//           item={selectedItem}
//           onClose={() => setSelectedItem(null)}
//           onUpdate={handleStockUpdate}
//         />
//       )}
//       {/* 🔧 Update Threshold Modal */}
//       {thresholdItem && (
//       <UpdateThresholdModal
//         item={thresholdItem}
//         onClose={() => setThresholdItem(null)}
//         onUpdate={handleStockUpdate}
//      />
// )}

//     </div>
//   );
// };

// export default AdjustStockPage;


import React, { useState, useEffect } from "react";
import AdjustStockModal from "../components/AdjustStockModal";
import UpdateThresholdModal from "../components/UpdateThresholdModal"; // <-- IMPORT ADDED
import { Search } from "lucide-react";
import api from "../utils/api"; // ✅ secured axios

const AdjustStockPage = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [thresholdItem, setThresholdItem] = useState(null); // <-- state for threshold modal
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/items");
        const responseData = Array.isArray(response.data.data) ? response.data.data : [];
        setItems(responseData);
        setError(null);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch items. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // 🔍 Filter items by name or itemName
  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📄 Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === "prev") return Math.max(1, prev - 1);
      if (direction === "next") return Math.min(totalPages, prev + 1);
      return prev;
    });
  };

  // update item in list after either stock or minStock change
  const handleStockUpdate = (updatedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
    setSelectedItem(null);
    setThresholdItem(null);
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Adjust Stock Levels</h1>
        <div className="relative w-64">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search items..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 📋 Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Minimum Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {item.name || item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.openingQty ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.minStock ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.openingQty === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    ) : item.openingQty <= item.minStock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-3">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Adjust Stock
                    </button>

                    <button
                      onClick={() => setThresholdItem(item)}
                      className="text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Edit Minimum Stock
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No items available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
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

      {/* 🔧 Adjust Stock Modal */}
      {selectedItem && (
        <AdjustStockModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleStockUpdate}
        />
      )}

      {/* 🔧 Update Threshold Modal */}
      {thresholdItem && (
        <UpdateThresholdModal
          item={thresholdItem}
          onClose={() => setThresholdItem(null)}
          onUpdate={handleStockUpdate}
        />
      )}
    </div>
  );
};

export default AdjustStockPage;

