import React, { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";

export default function StockTable({ items = [], onDeleteRequest, onEditName }) {
  const [openId, setOpenId] = useState(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRectsRef = useRef({});

  // Open dropdown & compute position
  const handleOpen = (e, itemId) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    buttonRectsRef.current[itemId] = rect;

    const DROPDOWN_WIDTH = 160;
    const DROPDOWN_HEIGHT_EST = 96;

    let left = rect.right - DROPDOWN_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - DROPDOWN_WIDTH - 8));

    let top = rect.top - DROPDOWN_HEIGHT_EST - 8;
    top = Math.max(8, top);

    setCoords({ top, left });
    setOpenId(openId === itemId ? null : itemId);
  };

  // Adjust position after dropdown mounts
  useEffect(() => {
    if (!openId) return;
    const rect = buttonRectsRef.current[openId];
    if (!rect) return;

    const dd = dropdownRef.current;
    if (!dd) return;

    const ddRect = dd.getBoundingClientRect();
    const DROPDOWN_WIDTH = ddRect.width;
    const DROPDOWN_HEIGHT = ddRect.height;

    let left = rect.right - DROPDOWN_WIDTH;
    left = Math.max(8, Math.min(left, window.innerWidth - DROPDOWN_WIDTH - 8));

    let top = rect.top - DROPDOWN_HEIGHT - 8;
    top = Math.max(8, top);

    if (top < 8 && rect.bottom + DROPDOWN_HEIGHT + 8 < window.innerHeight) {
      top = rect.bottom + 8;
    }

    setCoords({ top, left });
  }, [openId]);

  // Close on outside click or ESC
  useEffect(() => {
    const handleDocClick = () => setOpenId(null);
    const handleEsc = (ev) => ev.key === "Escape" && setOpenId(null);

    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const stopProp = (e) => e.stopPropagation();

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Item Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Current Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {items.length ? (
            items.map((it) => {
              const out = it.openingQty == null || it.openingQty === 0;
              const low = !out && it.openingQty <= (it.minStock ?? 0);

              return (
                <tr key={it._id} className="hover:bg-gray-50 relative">
                  <td className="px-6 py-4">{it.name || it.itemName}</td>
                  <td className="px-6 py-4">{it.openingQty ?? 0}</td>
                  <td className="px-6 py-4">
                    {it.price ? `$${parseFloat(it.price).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {out ? (
                      <span className="text-red-600 font-medium text-sm">
                        Out of Stock
                      </span>
                    ) : low ? (
                      <span className="text-yellow-600 font-medium text-sm">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium text-sm">
                        In Stock
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {/* three-dot button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen(e, it._id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      aria-haspopup="true"
                      aria-expanded={openId === it._id}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* floating dropdown */}
                    {openId === it._id && (
                      <div
                        ref={dropdownRef}
                        onClick={stopProp}
                        style={{
                          position: "fixed",
                          top: coords.top,
                          left: coords.left,
                          width: 160,
                          zIndex: 9999,
                          transition:
                            "transform 160ms cubic-bezier(.2,.9,.2,1), opacity 160ms",
                          transform: "translateY(0)",
                          opacity: 1,
                        }}
                        className="bg-white border rounded-md shadow-lg overflow-hidden"
                      >
                        <div className="flex flex-col">
                          <button
                            onClick={() => {
                              setOpenId(null);
                              onEditName(it);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50"
                          >
                            Edit Name
                          </button>

                          <button
                            onClick={() => {
                              setOpenId(null);
                              onDeleteRequest(it);
                            }}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                          >
                            Delete Item
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-4 text-center text-gray-500 italic"
              >
                No items available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}