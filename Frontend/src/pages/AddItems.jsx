// import React, { useState } from "react";
// import { ImagePlus, X } from "lucide-react";
// import api from "../utils/api"; // ✅ axios instance (handles token + branchId)

// const AddItems = ({ onClose, onItemAdded }) => {
//   const [enabled, setEnabled] = useState(false);
//   const [itemName, setItemName] = useState("");
//   const [category, setCategory] = useState("");
//   const [openingQty, setOpeningQty] = useState("");
//   const [minStock, setMinStock] = useState("");
//   const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
//   const [expiryDate, setExpiryDate] = useState("");
//   const [itemCode, setItemCode] = useState("");
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [popup, setPopup] = useState(null);

//   const generateItemCode = () => {
//     const code = `ITEM-${Math.floor(1000 + Math.random() * 9000)}`;
//     setItemCode(code);
//   };

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setImage(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const showPopup = (type, message) => {
//     setPopup({ type, message });
//     setTimeout(() => setPopup(null), 3000);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setPopup(null);

//     if (!itemName || !category) {
//       showPopup("error", "Please fill in required fields.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("name", itemName);
//       formData.append("category", category);
//       formData.append("openingQty", openingQty || 0);
//       formData.append("minStock", minStock || 0);
//       formData.append("itemCode", itemCode || `ITEM-${Date.now()}`);
//       formData.append("dateAdded", date);
//       if (expiryDate) formData.append("expiryDate", expiryDate);
//       if (image) formData.append("image", image);

//       // ✅ Axios interceptor will attach token + branchId
//       const response = await api.post("/api/items", formData);

//       // Reset form
//       setItemName("");
//       setCategory("");
//       setOpeningQty("");
//       setMinStock("");
//       setItemCode("");
//       setImage(null);
//       setImagePreview("");
//       setExpiryDate("");

//       showPopup("success", "Item added successfully!");

//       if (onItemAdded) onItemAdded(response.data);
//       if (onClose) setTimeout(() => onClose(), 2000);
//     } catch (error) {
//       let errMsg =
//         error.response?.data?.message ||
//         error.response?.data?.error ||
//         "Failed to add item. Please try again.";

//       // ✅ Catch duplicate key error (Mongo E11000)
//       if (
//         error.response?.data?.error?.includes("E11000") ||
//         error.response?.data?.message?.includes("duplicate key") ||
//         errMsg.toLowerCase().includes("duplicate key")
//       ) {
//         errMsg = "Item code already exists in this branch.";
//       }

//       showPopup("error", errMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6 md:p-8 lg:p-10 relative">
//       {/* Popup */}
//       {popup && (
//         <div
//           className={`fixed z-50 left-1/2 top-10 transform -translate-x-1/2 ${
//             popup.type === "success"
//               ? "bg-green-500 text-white"
//               : "bg-red-500 text-white"
//           } px-6 py-3 rounded shadow-lg animate-fade-in-up`}
//           style={{ minWidth: 250, textAlign: "center" }}
//         >
//           {popup.message}
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between bg-teal-800 text-white p-4">
//           <div className="flex gap-6 items-center">
//             <h2 className="text-xl md:text-2xl font-semibold">Add Item</h2>
//             <div className="flex items-center space-x-4">
//               <span>Product</span>
//               <div
//                 className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
//                   enabled ? "bg-teal-500" : "bg-gray-300"
//                 }`}
//                 onClick={() => setEnabled(!enabled)}
//               >
//                 <div
//                   className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
//                     enabled ? "translate-x-5" : "translate-x-0"
//                   }`}
//                 />
//               </div>
//               <span>Service</span>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full hover:bg-teal-700 transition-colors"
//             disabled={loading}
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Form */}
//         <div className="p-4 sm:p-6">
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Item Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Item Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={itemName}
//                   onChange={(e) => setItemName(e.target.value)}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
//                   required
//                 />
//               </div>

//               {/* Category */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Category <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={category}
//                   onChange={(e) => setCategory(e.target.value)}
//                   className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
//                   required
//                 >
//                   <option value="">Select</option>
//                   <option value="Medications">Medications</option>
//                   <option value="Consumables">Consumables</option>
//                   <option value="General">General</option>
//                   <option value="Apparatus">Apparatus</option>
//                   <option value="Skin Care Products">Skin Care Products</option>
//                   <option value="Medication (Fridge)">
//                     Medication (Fridge)
//                   </option>
//                 </select>
//               </div>

//               {/* Units */}
//               <div className="flex items-end">
//                 <button
//                   type="button"
//                   className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition-colors"
//                   onClick={generateItemCode}
//                 >
//                   Generate Code
//                 </button>
//               </div>

//               {/* Image Upload */}
//               <div>
//                 <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
//                   <ImagePlus size={18} />
//                   <span className="text-sm font-medium">Add Image</span>
//                   <input
//                     type="file"
//                     className="hidden"
//                     onChange={handleImageUpload}
//                   />
//                 </label>
//                 {imagePreview && (
//                   <div className="mt-2">
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       className="h-16 w-16 object-cover rounded-md"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Stock Section */}
//             <div className="mt-6">
//               <h2 className="text-lg font-semibold text-gray-700 mb-4">
//                 Stock Information
//               </h2>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Opening Quantity
//                   </label>
//                   <input
//                     type="number"
//                     value={openingQty}
//                     onChange={(e) => setOpeningQty(e.target.value)}
//                     className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Min Stock To Maintain
//                   </label>
//                   <input
//                     type="number"
//                     value={minStock}
//                     onChange={(e) => setMinStock(e.target.value)}
//                     className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     As Of Date
//                   </label>
//                   <input
//                     type="date"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                     className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Expiry Date
//                   </label>
//                   <input
//                     type="date"
//                     value={expiryDate}
//                     onChange={(e) => setExpiryDate(e.target.value)}
//                     className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Submit */}
//             <div className="mt-6">
//               <button
//                 type="submit"
//                 className={`w-full sm:w-auto px-6 py-2 rounded-md text-white font-medium ${
//                   loading
//                     ? "bg-teal-400 cursor-not-allowed"
//                     : "bg-teal-600 hover:bg-teal-700"
//                 } transition-colors`}
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : "Save Item"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Popup animation */}
//       <style>
//         {`
//           .animate-fade-in-up {
//             animation: fadeInUp 0.4s;
//           }
//           @keyframes fadeInUp {
//             from { opacity: 0; transform: translateY(40px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default AddItems;



import React, { useState } from "react";
import { X } from "lucide-react";
import api from "../utils/api"; // ✅ axios instance (handles token + branchId)

const AddItems = ({ onClose, onItemAdded }) => {
  const [enabled, setEnabled] = useState(false);
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [openingQty, setOpeningQty] = useState("");
  const [minStock, setMinStock] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);

  const generateItemCode = () => {
    const code = `ITEM-${Math.floor(1000 + Math.random() * 9000)}`;
    setItemCode(code);
  };

  const showPopup = (type, message) => {
    setPopup({ type, message });
    setTimeout(() => setPopup(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPopup(null);

    if (!itemName || !category) {
      showPopup("error", "Please fill in required fields.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Build JSON payload
      const payload = {
        name: itemName,  // Backend expects "name", not "itemName"
        category: category,
        openingQty: parseInt(openingQty) || 0,
        minStock: parseInt(minStock) || 0,
        itemCode: itemCode || `ITEM-${Date.now()}`,
        dateAdded: date,
      };

      // Only add optional fields if they have values
      if (expiryDate) payload.expiryDate = expiryDate;
      if (price) payload.price = parseFloat(price);

      console.log("📤 Sending payload:", payload); // Debug log

      // ✅ Send as JSON instead of FormData
      const response = await api.post("/api/items", payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("✅ Response:", response.data); // Debug log

      // Reset form
      setItemName("");
      setCategory("");
      setOpeningQty("");
      setMinStock("");
      setItemCode("");
      setPrice("");
      setExpiryDate("");

      showPopup("success", "Item added successfully!");

      if (onItemAdded) onItemAdded(response.data);
      if (onClose) setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("❌ Full error:", error);
      console.error("❌ Error response:", error.response?.data);
      
      let errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add item. Please try again.";

      // ✅ Catch duplicate key error (Mongo E11000)
      if (
        error.response?.data?.error?.includes("E11000") ||
        error.response?.data?.message?.includes("duplicate key") ||
        errMsg.toLowerCase().includes("duplicate key") ||
        errMsg.toLowerCase().includes("already exists")
      ) {
        errMsg = "Item with this name or code already exists in this branch.";
      }

      showPopup("error", errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 relative">
      {/* Popup */}
      {popup && (
        <div
          className={`fixed z-50 left-1/2 top-10 transform -translate-x-1/2 ${
            popup.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          } px-6 py-3 rounded shadow-lg animate-fade-in-up`}
          style={{ minWidth: 250, textAlign: "center" }}
        >
          {popup.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-teal-800 text-white p-4">
          <div className="flex gap-6 items-center">
            <h2 className="text-xl md:text-2xl font-semibold">Add Item</h2>
            <div className="flex items-center space-x-4">
              <span>Product</span>
              <div
                className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  enabled ? "bg-teal-500" : "bg-gray-300"
                }`}
                onClick={() => setEnabled(!enabled)}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span>Service</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-teal-700 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
                  required
                >
                  <option value="">Select</option>
                  <option value="Medications">Medications</option>
                  <option value="Consumables">Consumables</option>
                  <option value="General">General</option>
                  <option value="Apparatus">Apparatus</option>
                  <option value="Skin Care Products">Skin Care Products</option>
                  <option value="Medication (Fridge)">
                    Medication (Fridge)
                  </option>
                </select>
              </div>

              {/* Generate Code Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition-colors"
                  onClick={generateItemCode}
                >
                  Generate Code
                </button>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* Stock Section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Stock Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Quantity
                  </label>
                  <input
                    type="number"
                    value={openingQty}
                    onChange={(e) => setOpeningQty(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock To Maintain
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    As Of Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <button
                type="submit"
                className={`w-full sm:w-auto px-6 py-2 rounded-md text-white font-medium ${
                  loading
                    ? "bg-teal-400 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                } transition-colors`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Item"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Popup animation */}
      <style>
        {`
          .animate-fade-in-up {
            animation: fadeInUp 0.4s;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default AddItems;