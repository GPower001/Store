// components/layout/Sidebar.jsx
import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, LogOut, Settings2, ShieldCheck, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { navigationGroups, primaryNavigation, sidebarBrand } from "../../utils/navigationData";
import useAuthStore from "../../store/authStore";

function Sidebar({ open, collapsed, onClose, onCollapse }) {
	const logout = useAuthStore((state) => state.logout);
	const navigate = useNavigate();

	const [openGroups, setOpenGroups] = useState(() =>
		Object.fromEntries(navigationGroups.map((group) => [group.label, true]))
	);
	const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);

	const toggleGroup = (label) => {
		setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
	};

	const confirmLogout = () => {
		setLogoutConfirmationOpen(false);
		void logout();
		onClose();
		navigate("/login", { replace: true });
	};

	const BrandIcon = sidebarBrand.icon;

	return (
		<>
		<aside className={`app-sidebar ${open ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}>
			<div className="sidebar-top">
				<div className="sidebar-brand">
					<span className="sidebar-brand-icon">
						<BrandIcon size={16} />
					</span>
					<strong><span className="brand-stock">Stock</span><span className="brand-room">Room</span></strong>
				</div>

				<button className="sidebar-collapse" onClick={onCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
					{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
				</button>

				<button className="mobile-close" onClick={onClose} aria-label="Close navigation">
					<X size={20} />
				</button>
			</div>

			<nav className="sidebar-nav" aria-label="Main navigation">
				<NavigationLinks items={primaryNavigation} onClose={onClose} />

				{navigationGroups.map((group) => {
					const isOpen = !!openGroups[group.label];
					return (
						<div className="nav-group" key={group.label}>
							<button
								type="button"
								className="nav-group-toggle"
								onClick={() => toggleGroup(group.label)}
								aria-expanded={isOpen}
							>
								<span>{group.label.toUpperCase()}</span>
								<ChevronDown size={14} className={isOpen ? "is-open" : ""} />
							</button>
							{isOpen && <NavigationLinks items={group.items} onClose={onClose} />}
						</div>
					);
				})}
			</nav>

			<div className="sidebar-bottom">
				<NavLink
					className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
					to="/settings"
					onClick={onClose}
					title="Settings"
				>
					<Settings2 size={18} />
					<span>Settings</span>
				</NavLink>

				<button type="button" className="nav-item nav-item-logout" onClick={() => setLogoutConfirmationOpen(true)} title="Logout">
					<LogOut size={18} />
					<span>Logout</span>
				</button>

				<div className="trial-meter">
					<div>
						<span>Subscription</span>
						<b>Manage plan</b>
					</div>
					<div className="meter-track">
						<span />
					</div>
					<button type="button" onClick={() => navigate("/subscription")}>
						View plans <ChevronDown size={14} />
					</button>
				</div>
			</div>
		</aside>
		{logoutConfirmationOpen && (
			<div className="logout-dialog-backdrop" role="presentation" onMouseDown={(event) => {
				if (event.target === event.currentTarget) setLogoutConfirmationOpen(false);
			}}>
				<section className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
					<div className="logout-dialog-visual">
						<span className="logout-dialog-orbit" />
						<div className="logout-dialog-icon"><LogOut size={22} /></div>
						<p>SECURE EXIT</p>
						<strong>Stock<span>Room</span></strong>
					</div>
					<div className="logout-dialog-content">
						<p className="logout-dialog-kicker">End session</p>
						<h2 id="logout-dialog-title">Ready to step away?</h2>
						<p>Your workspace will be locked until you sign in again.</p>
						<div className="logout-session-note">
							<ShieldCheck size={18} />
							<span><strong>Session protected</strong><small>Your data stays secure while you are away.</small></span>
						</div>
						<div className="logout-dialog-actions">
							<button type="button" className="logout-cancel" onClick={() => setLogoutConfirmationOpen(false)}>Stay signed in</button>
							<button type="button" className="logout-confirm" onClick={confirmLogout}>Log out <ArrowRight size={15} /></button>
						</div>
					</div>
				</section>
			</div>
		)}
		</>
	);
}

function NavigationLinks({ items, onClose }) {
	return items.map(({ label, icon: Icon, to }) => (
		<NavLink
			className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
			to={to}
			key={label}
			onClick={onClose}
			title={label}
		>
			<Icon size={18} />
			<span>{label}</span>
		</NavLink>
	));
}

export default Sidebar;