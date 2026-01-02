import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../utils/api";

const capitalizeName = (name = "") =>
  name.trim().length === 0
    ? ""
    : name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

const EditNameModal = ({ item, onClose, onSaved, showPopup }) => {
  const [name, setName] = useState(capitalizeName(item?.name ?? item?.itemName ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(capitalizeName(item?.name ?? item?.itemName ?? ""));
    setError("");
  }, [item]);

  const handleSave = async () => {
    const formatted = capitalizeName(name);
    if (!formatted) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.patch(`/api/items/${item._id}`, { name: formatted });
      onSaved(response.data.data);
      if (showPopup) showPopup("success", "Name updated successfully.");
      onClose();
    } catch (err) {
      console.error("Edit name error:", err);
      setError(err.response?.data?.message || "Failed to update name");
      if (showPopup) showPopup("error", "Failed to update name.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center border-b p-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Edit Item Name</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            maxLength={100}
            autoFocus
          />

          {error && <div className="mt-3 p-2 bg-red-50 text-red-700 rounded">{error}</div>}

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNameModal;
