// import { Bell, ChevronDown, Menu, Search } from "lucide-react";
// import useAuthStore from "../../store/authStore";
// import { navbarData } from "../../utils/navigationData";

// function Navbar({ onMenuClick }) {
// 	const user = useAuthStore((state) => state.user);
// 	  const displayName = user?.name || navbarData.profileFallback;
// 	  const initials = displayName.split(" ").map((name) => name[0]).join("").slice(0, 2);
// 	  return <header className="app-navbar"><button className="mobile-menu" onClick={onMenuClick} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumb"><span>{navbarData.breadcrumb.section}</span><b>/</b><strong>{navbarData.breadcrumb.current}</strong></div><div className="navbar-tools"><label className="search-field"><Search size={17} /><input placeholder={navbarData.searchPlaceholder} aria-label={navbarData.searchPlaceholder} /></label><button className="notification-button" aria-label="Notifications"><Bell size={19} /><span /></button><div className="profile-menu"><span className="profile-avatar">{initials}</span><span className="profile-copy"><b>{displayName}</b><small>{user?.role || navbarData.profileRoleFallback}</small></span><ChevronDown size={15} /></div></div></header>;
// }

// export default Navbar;

// components/layout/Navbar.jsx
import { Bell, Check, ChevronRight, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { navbarData } from "../../utils/navigationData";
import { getNotifications, markNotificationRead } from "../../services/notificationService";

function Navbar({ onMenuClick }) {
	const user = useAuthStore((state) => state.user);
	const [notifications, setNotifications] = useState([]);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const notificationRef = useRef(null);
	const notificationRequestRef = useRef(false);
	const organizationName = user?.companyName || user?.tenantId?.companyName || user?.tenant?.companyName || "";
	const displayName = user?.name || navbarData.profileFallback;
	const initials = displayName
		.split(" ")
		.map((name) => name[0])
		.join("")
		.slice(0, 2);

	useEffect(() => {
		let active = true;
		const loadNotifications = () => {
			if (notificationRequestRef.current) return;
			notificationRequestRef.current = true;
			getNotifications().then((data) => { if (active) setNotifications(data); }).catch(() => {}).finally(() => { notificationRequestRef.current = false; });
		};
		loadNotifications();
		const timer = window.setInterval(loadNotifications, 1000);
		return () => { active = false; window.clearInterval(timer); };
	}, []);

	useEffect(() => {
		const close = (event) => { if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationsOpen(false); };
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);

	const unreadCount = notifications.filter((notification) => !notification.isRead).length;
	const readNotification = async (notification) => {
		if (notification.isRead) return;
		try { await markNotificationRead(notification._id); setNotifications((current) => current.map((entry) => entry._id === notification._id ? { ...entry, isRead: true } : entry)); } catch (error) { console.error("Unable to mark notification as read", error); }
	};

	return (
		<header className="app-navbar">
			<button className="mobile-menu" onClick={onMenuClick} aria-label="Open navigation">
				<Menu size={21} />
			</button>

			<div className="navbar-brand">
				<span>{navbarData.brand.label.toUpperCase()}</span>
				<strong>{organizationName}</strong>
			</div>

			<div className="navbar-tools">
				<label className="navbar-search">
					<Search size={17} />
					<input type="search" placeholder={navbarData.searchPlaceholder || "Search"} aria-label="Search" />
				</label>

				<div className="notification-menu" ref={notificationRef}>
				<button className="notification-button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} onClick={() => setNotificationsOpen((open) => !open)}>
					<Bell size={19} />
					{unreadCount > 0 && <span>{unreadCount > 9 ? "9+" : unreadCount}</span>}
				</button>
				{notificationsOpen && <div className="notification-dropdown"><div className="notification-dropdown-heading"><div><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} unread` : "All caught up"}</small></div><button onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={15} /></button></div><div className="notification-dropdown-list">{notifications.length ? notifications.slice(0, 5).map((notification) => <button className={`notification-item ${notification.isRead ? "is-read" : ""}`} key={notification._id} onClick={() => readNotification(notification)}><span className={`notification-dot ${notification.type}`} /><span><strong>{notification.message}</strong><small>{notification.item} · {new Date(notification.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</small></span>{!notification.isRead && <Check size={13} />}</button>) : <div className="notification-empty">No notifications yet.</div>}</div><Link className="notification-dropdown-footer" to="/notifications" onClick={() => setNotificationsOpen(false)}>View all notifications <ChevronRight size={14} /></Link></div>}
				</div>

				<div className="profile-menu">
					<span className="profile-avatar">{initials}</span>
					<span className="profile-copy profile-copy-name">{displayName}</span>
				</div>
			</div>
		</header>
	);
}

export default Navbar;