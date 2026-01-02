import React from 'react'

function Consumables({item}) {
    // Calculate stock status
    const isLowStock = item.openingQty <= item.minStock; 
    const statusClass = isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    const statusText = isLowStock ? 'Low Stock' : 'In Stock';
  
    return (
      <tr className="hover:bg-gray-50">
        <td className="align-middle">
          <span className="fw-semibold">{item.name}</span>
        </td>
        <td className="align-middle">
          <span>{item.category}</span>
        </td>
        <td className="align-middle">
          {item.openingQty} {/* Corrected property name */}
        </td>
        <td className="align-middle">
          <span className={`${statusClass}`}>
            {statusText}
          </span>
        </td>
      </tr>
    );
}

export default Consumables;
