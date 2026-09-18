import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	return <div className={`app-shell ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}><Sidebar open={sidebarOpen} collapsed={sidebarCollapsed} onClose={() => setSidebarOpen(false)} onCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)} /><div className="app-main"><Navbar onMenuClick={() => setSidebarOpen(true)} /><main className="app-page"><Outlet /></main></div>{sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation overlay" />}</div>;
}

export default DashboardLayout;
