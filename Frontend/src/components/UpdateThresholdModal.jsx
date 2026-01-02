// import { useState } from 'react';
// import { X } from 'lucide-react';
// import api from '../utils/api';

// const UpdateThresholdModal = ({ item, onClose, onUpdate }) => {
//   const [minStock, setMinStock] = useState(item.minStock ?? 0);
//   const [loading, setLoading] = useState(false);

//   const handleSave = async () => {
//     if (isNaN(minStock) || minStock < 0) return;

//     try {
//       setLoading(true);
//       const response = await api.patch(`/api/items/${item._id}`, { minStock });
//       onUpdate(response.data.data);
//       onClose();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        
//         <div className="flex justify-between items-center border-b p-4 bg-gray-50">
//           <h2 className="text-xl font-bold text-gray-800">
//             Edit Minimum Stock: <span className="text-teal-600">{item.name}</span>
//           </h2>
//           <button onClick={onClose}>
//             <X size={20} className="text-gray-500 hover:text-gray-700" />
//           </button>
//         </div>

//         <div className="p-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Minimum Stock Threshold
//           </label>
//           <input
//             type="number"
//             min="0"
//             value={minStock}
//             onChange={(e) => setMinStock(Number(e.target.value))}
//             className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
//           />

//           <div className="flex justify-end gap-3 mt-6">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={loading}
//               className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
//             >
//               {loading ? 'Saving...' : 'Save'}
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default UpdateThresholdModal;


import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../utils/api';

const UpdateThresholdModal = ({ item, onClose, onUpdate }) => {
  const [minStock, setMinStock] = useState(Number(item.minStock ?? 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (isNaN(minStock) || minStock < 0) {
      setError('Invalid number');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await api.patch(`/api/items/${item._id}`, { minStock });
      onUpdate(response.data.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update threshold');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center border-b p-4 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            Edit Minimum Stock: <span className="text-teal-600">{item.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Stock Threshold
          </label>

          <input
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />

          {error && (
            <div className="mt-3 p-2 bg-red-50 text-red-700 rounded">{error}</div>
          )}

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
              disabled={loading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateThresholdModal;
