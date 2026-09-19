// import { Navigate, Route, Routes } from "react-router-dom";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";

// function App() {
// 	return <Routes><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/dashboard" element={<WorkspaceReady />} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
// }

// function WorkspaceReady() {
// 	const user = JSON.parse(localStorage.getItem("inventory_user") || "null");
// 	return <main className="workspace-ready"><div className="brand-mark"><span>ST</span> Stockroom</div><p className="panel-kicker">Workspace ready</p><h1>Welcome{user?.name ? `, ${user.name}` : ""}.</h1><p>Your inventory workspace is ready for the next step.</p><button className="submit-button" onClick={() => { localStorage.removeItem("inventory_token"); localStorage.removeItem("inventory_user"); window.location.href = "/login"; }}>Sign out</button></main>;
// }

// export default App;
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layouts/DashboardLayout";
import POS from "./pages/POS";
import CreateOrder from "./pages/CreateOrder";
import SalesHistory from "./pages/SalesHistory";
import Landing from "./pages/Landing";
import SubscriptionCheckout from "./pages/SubscriptionCheckout";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import Branches from "./pages/Branches";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Subscription from "./pages/Subscription";
import BranchActivity from "./pages/BranchActivity";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/subscription/checkout" element={<SubscriptionCheckout />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/pos/orders/new" element={<CreateOrder />} />
          <Route path="/sales" element={<SalesHistory />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/activity" element={<BranchActivity />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/subscription" element={<Subscription />} />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;