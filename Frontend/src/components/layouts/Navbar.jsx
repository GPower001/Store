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
import { Bell, Menu, Search } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { navbarData } from "../../utils/navigationData";

function Navbar({ onMenuClick }) {
	const user = useAuthStore((state) => state.user);
	const organizationName = user?.companyName || user?.tenantId?.companyName || user?.tenant?.companyName || "";
	const displayName = user?.name || navbarData.profileFallback;
	const initials = displayName
		.split(" ")
		.map((name) => name[0])
		.join("")
		.slice(0, 2);

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

				<button className="notification-button" aria-label="Notifications">
					<Bell size={19} />
					<span />
				</button>

				<div className="profile-menu">
					<span className="profile-avatar">{initials}</span>
					<span className="profile-copy profile-copy-name">{displayName}</span>
				</div>
			</div>
		</header>
	);
}

export default Navbar;