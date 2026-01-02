// import React from 'react'

// function MedicationItems({item}) {
//   return (
//     <tr>
//         {/* <th scope='row'>  
//             <a href='#'>
//                 <img src={item._id} alt=''/>
//             </a>
//         </th>*/} 
//         <td>{item.name}</td>
//         <td>{item.category}</td>
//         <td>{item.quantity}</td>
//         <td> {item.quantity <= item.lowStockThreshold ? (
//                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                     Low Stock
//                 </span>
//                 ) : (
//                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                     In Stock
//                 </span>
//             )}
//         </td>
//     </tr>
//   )
// }

// export default MedicationItems;

// import React from 'react';

// function MedicationItems({ item }) {
//   // Calculate stock status
//   const isLowStock = item.openingQty <= item.minStock; // Corrected property name
//   const statusClass = isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
//   const statusText = isLowStock ? 'Low Stock' : 'In Stock';

//   return (
//     <tr className="hover:bg-gray-50">
//       <td className="align-middle">
//         <span className="fw-semibold">{item.name}</span>
//       </td>
//       <td className="align-middle">
//         <span>{item.category}</span>
//       </td>
//       <td className="align-middle">
//         {item.openingQty} {/* Corrected property name */}
//       </td>
//       <td className="align-middle">
//         <span className={`${statusClass}`}>
//           {statusText}
//         </span>
//       </td>
//     </tr>
//   );
// }

// export default MedicationItems;
