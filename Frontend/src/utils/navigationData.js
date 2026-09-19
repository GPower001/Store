import {
	BarChart3,
	Boxes,
	FileText,
	LayoutGrid,
	ShoppingCart,
	Store,
	UsersRound,
	Warehouse,
} from "lucide-react";

export const sidebarBrand = {
	name: "StockRoom",
	icon: Store,
};

// Flat top-level items, no section label
export const primaryNavigation = [
	{ label: "Dashboard", icon: LayoutGrid, to: "/dashboard" },
	{ label: "Point of Sale", icon: ShoppingCart, to: "/pos" },
	{ label: "Inventory", icon: Boxes, to: "/inventory" },
	{ label: "Reports", icon: BarChart3, to: "/reports" },
];

// Collapsible groups
export const navigationGroups = [
	{
		label: "Sales",
		items: [
			{ label: "Sales history", icon: FileText, to: "/sales" },
			{ label: "Invoices", icon: FileText, to: "/invoices" },
		],
	},
	{
		label: "More",
		items: [
			{ label: "Branches", icon: Warehouse, to: "/branches" },
			{ label: "Team members", icon: UsersRound, to: "/users" },
		],
	},
];

// Used by Navbar.jsx
export const navbarData = {
	brand: {
		label: "Business",
		name: "Gstore",
	},
	profileFallback: "Account",
	profileRoleFallback: "Account",
};