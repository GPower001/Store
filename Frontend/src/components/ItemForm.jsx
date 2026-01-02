import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemDetails from './ItemDetails';
import StockInfo from './StockInfo';
import DateInput from './DateInput';

const ItemForm = () => {
  const navigate = useNavigate();
  const [item, setItem] = useState({
    itemName: '',
    category: '',
    units: '',
    itemCode: '',
    openingQuantity: '',
    atPrice: '',
    minStock: '',
    location: '',
    asOfDate: new Date().toISOString().split('T')[0],
    image: null,
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    
    // Validate required fields (adjust according to your API requirements)
    if (!item.itemName || !item.category || !item.units || !item.minStock) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Map your state to the exact fields the API expects
          name: item.itemName, // Example: if API expects 'name' not 'itemName'
          category: item.category,
          units: item.units,
          code: item.itemCode,
          quantity: item.openingQuantity,
          price: item.atPrice,
          min_stock: item.minStock,
          location: item.location,
          date: item.asOfDate
          // Add other required fields as per your API
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API validation errors
        throw new Error(data.error?.message || 'Failed to save item');
      }

      if (data.category === 'Medication') {
        navigate('/medications');
      } else {
        navigate('/items');
      }
      
    } catch (error) {
      console.error('Error saving item:', error.message);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ItemDetails item={item} handleChange={handleChange} />
      <StockInfo item={item} handleChange={handleChange} />
      <DateInput item={item} handleChange={handleChange} />
      
      {error && (
        <div className="alert alert-danger mt-2">
          {error}
        </div>
      )}
      
      <button type="submit" className="btn btn-primary mt-3" id='but'>
        Save Item
      </button>
    </form>
  );
};

export default ItemForm;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ItemDetails from './ItemDetails';
// import StockInfo from './StockInfo';
// import DateInput from './DateInput';

// const ItemForm = () => {
//   const navigate = useNavigate();
//   const [item, setItem] = useState({
//     itemName: '',
//     category: '',
//     units: '',
//     itemCode: '',
//     openingQuantity: '',
//     atPrice: '',
//     minStock: '',
//     location: '',
//     asOfDate: new Date().toISOString().split('T')[0], // Current date
//     image: null,
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setItem((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (data) => {
//     // e.preventDefault();
//     console.log('Submitting data:', data);
//     try {
//       const response = await fetch('/api/items', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(item),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save item');
//       }

//       const savedItem = await response.json();
      
//       // If it's a medication, redirect to medications page
//       if (savedItem.category === 'Medication') {
//         navigate('/medications');
//       } else {
//         // Handle other categories
//         navigate('/items');
//       }
      
//     } catch (error) {
//       // console.error('Error saving item:', error);
//       console.error('Error details:', error.response?.data);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <ItemDetails item={item} handleChange={handleChange} />
//       <StockInfo item={item} handleChange={handleChange} />
//       <DateInput item={item} handleChange={handleChange} />
//       <button type="submit" className="btn btn-primary mt-3" id='but'>
//         Save Item
//       </button>
//     </form>
//   );
// };

// export default ItemForm;