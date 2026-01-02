import { useState, useEffect } from 'react';
import { X, Minus, Plus as PlusIcon, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const AdjustStockModal = ({ item, onClose, onUpdate }) => {
  const [quantityToAdjust, setQuantityToAdjust] = useState(1);
  const [adjustmentType, setAdjustmentType] = useState('remove'); // 'add' or 'remove'
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStockLevel, setNewStockLevel] = useState(item.openingQty);

  useEffect(() => {
    setNewStockLevel(
      adjustmentType === 'add'
        ? item.openingQty + quantityToAdjust
        : item.openingQty - quantityToAdjust
    );
  }, [quantityToAdjust, adjustmentType, item.openingQty]);

  const handleQuantityChange = (value) => {
    let num = parseInt(value) || 0;
    if (adjustmentType === 'remove' && num > item.openingQty) {
      num = item.openingQty;
    } else if (num < 1) {
      num = 1;
    }
    setQuantityToAdjust(num);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const additionalStock = adjustmentType === 'add' ? quantityToAdjust : -quantityToAdjust;
      const response = await api.patch(`/api/items/${item._id}`, { additionalStock });
      onUpdate(response.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            Adjust Stock: <span className="text-teal-600">{item.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Current Stock</p>
              <p className="text-2xl font-bold">{item.openingQty}</p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                newStockLevel <= item.minStock ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              <p className="text-sm text-gray-500">New Stock Level</p>
              <p className="text-2xl font-bold">{newStockLevel}</p>
              {newStockLevel <= item.minStock && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                  <AlertTriangle size={14} className="mr-1" />
                  Below threshold ({item.minStock})
                </p>
              )}
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setAdjustmentType('add')}
              className={`flex-1 py-2 px-4 rounded-l-lg border ${
                adjustmentType === 'add'
                  ? 'bg-teal-100 border-teal-500 text-teal-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <PlusIcon size={16} />
                Add Stock
              </div>
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('remove')}
              className={`flex-1 py-2 px-4 rounded-r-lg border ${
                adjustmentType === 'remove'
                  ? 'bg-red-100 border-red-500 text-red-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Minus size={16} />
                Remove Stock
              </div>
            </button>
          </div>

          {/* Quantity Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {adjustmentType === 'add' ? 'Quantity to Add' : 'Quantity to Remove'}
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantityToAdjust - 1)}
                  className="p-2 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100"
                  disabled={quantityToAdjust <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={adjustmentType === 'remove' ? item.openingQty : undefined}
                  value={quantityToAdjust}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="flex-1 p-2 border-t border-b border-gray-300 text-center"
                />
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantityToAdjust + 1)}
                  className="p-2 border border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100"
                  disabled={adjustmentType === 'remove' && quantityToAdjust >= item.openingQty}
                >
                  <PlusIcon size={16} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
                <AlertTriangle size={16} className="mr-2" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg text-white flex items-center justify-center min-w-24 ${
                  adjustmentType === 'add'
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                ) : adjustmentType === 'add' ? (
                  <PlusIcon size={16} className="mr-2" />
                ) : (
                  <Minus size={16} className="mr-2" />
                )}
                {isSubmitting ? 'Processing...' : adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdjustStockModal;
