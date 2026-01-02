// import { useEffect, useState } from "react";
// import api from "../utils/api"; // ✅ your secured axios instance
// import { Loader2 } from "lucide-react";

// const CreateBranch = () => {
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [branches, setBranches] = useState([]);
//   const [fetching, setFetching] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   // Fetch all branches
//   const fetchBranches = async () => {
//     try {
//       setFetching(true);
//       const response = await api.get("/api/branches");
//       setBranches(response.data.data || []);
//     } catch (error) {
//       console.error("Error fetching branches:", error.message);
//     } finally {
//       setFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   // Handle create new branch
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: "", text: "" });

//     try {
//       await api.post("/api/branches", { name });
//       setMessage({ type: "success", text: "✅ Branch created successfully!" });
//       setName("");
//       fetchBranches(); // Refresh list
//     } catch (error) {
//       setMessage({
//         type: "error",
//         text:
//           error.response?.data?.message ||
//           "❌ Failed to create branch. Try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center min-h-screen bg-gray-100 px-4 py-8">
//       {/* Create Branch Form */}
//       <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 mb-10">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//           Create New Branch
//         </h2>

//         {message.text && (
//           <div
//             className={`mb-4 p-3 rounded-lg text-sm ${
//               message.type === "success"
//                 ? "bg-green-100 text-green-700 border border-green-300"
//                 : "bg-red-100 text-red-700 border border-red-300"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Branch Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Branch Name
//             </label>
//             <input
//               type="text"
//               placeholder="e.g., Lagos HQ"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             />
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="animate-spin" size={18} />
//                 Creating...
//               </>
//             ) : (
//               "Create Branch"
//             )}
//           </button>
//         </form>
//       </div>

//       {/* Branch List */}
//       <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4">All Branches</h2>

//         {fetching ? (
//           <div className="flex justify-center py-6">
//             <Loader2 className="animate-spin text-blue-600" size={24} />
//           </div>
//         ) : branches.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
//               <thead className="bg-gray-100 text-gray-700">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-sm font-medium border-b">
//                     #
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium border-b">
//                     Branch Name
//                   </th>
//                   <th className="px-4 py-2 text-left text-sm font-medium border-b">
//                     Created At
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {branches.map((branch, idx) => (
//                   <tr key={branch._id} className="hover:bg-gray-50">
//                     <td className="px-4 py-2 text-sm border-b">{idx + 1}</td>
//                     <td className="px-4 py-2 text-sm font-medium border-b text-gray-800">
//                       {branch.name}
//                     </td>
//                     <td className="px-4 py-2 text-sm border-b text-gray-500">
//                       {new Date(branch.createdAt).toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 text-sm">No branches available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateBranch;


import { useEffect, useState } from "react";
import api from "../utils/api";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

const CreateBranch = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [warningBranch, setWarningBranch] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ============================
     FETCH BRANCHES
  ============================ */
  const fetchBranches = async () => {
    try {
      setFetching(true);
      const res = await api.get("/api/branches");
      setBranches(res.data?.data || []);
    } catch (error) {
      console.error("Fetch Branches Error:", error);
      setMessage({ type: "error", text: "❌ Failed to fetch branches" });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  /* ============================
     CREATE BRANCH
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.post("/api/branches", { name });
      setMessage({ type: "success", text: "✅ Branch created successfully!" });
      setName("");
      fetchBranches();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "❌ Failed to create branch",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     DELETE BRANCH (ADMIN ONLY)
  ============================ */
  const handleDeleteBranch = async (branchId) => {
    setDeleting(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.delete(`/api/branches/${branchId}`);
      setMessage({ type: "success", text: res.data?.message || "✅ Branch deleted successfully" });
      setWarningBranch(null);
      fetchBranches();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "❌ Failed to delete branch",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 px-4 py-8">
      {/* CREATE BRANCH */}
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New Branch</h2>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
            <input
              type="text"
              placeholder="e.g., Lagos HQ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Creating...
              </>
            ) : (
              "Create Branch"
            )}
          </button>
        </form>
      </div>

      {/* BRANCH LIST */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">All Branches</h2>

        {fetching ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : branches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium border-b">#</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border-b">Branch Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border-b">Created At</th>
                  <th className="px-4 py-2 text-left text-sm font-medium border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch, idx) => (
                  <tr key={branch._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm border-b">{idx + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium border-b text-gray-800">{branch.name}</td>
                    <td className="px-4 py-2 text-sm border-b text-gray-500">{new Date(branch.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm border-b">
                      <button
                        onClick={() => setWarningBranch(branch)}
                        className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No branches available.</p>
        )}
      </div>

      {/* WARNING MODAL */}
      {warningBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            <AlertTriangle className="mx-auto text-red-600" size={48} />
            <h3 className="text-lg font-semibold mt-4 mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{warningBranch.name}</strong>?<br />
              This will remove all items, notifications, and non-admin users in this branch. This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDeleteBranch(warningBranch._id)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                {deleting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
              </button>
              <button
                onClick={() => setWarningBranch(null)}
                disabled={deleting}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBranch;
