import {
  BarChart3,
  Boxes,
  ShoppingCart,
  UsersRound,
} from "lucide-react";

export const features = [
  {
    icon: ShoppingCart,
    tone: "blue",
    title: "Sell without slowing down",
    text: "A focused POS for quick checkout, barcode scanning, flexible payments, and receipts that stay tied to stock.",
  },
  {
    icon: Boxes,
    tone: "pink",
    title: "Know what is moving",
    text: "Track quantities, reorder points, branches, and product performance before small gaps become expensive surprises.",
  },
  {
    icon: BarChart3,
    tone: "mint",
    title: "See the business clearly",
    text: "Turn daily activity into useful signals with sales history, reports, stock movements, and live dashboard insight.",
  },
  {
    icon: UsersRound,
    tone: "orange",
    title: "Give teams the right access",
    text: "Keep each branch organized with roles, permissions, and a workspace built for growing teams.",
  },
];

export const steps = [
  {
    title: "Open the dashboard",
    text: "See what needs attention before the day gets loud.",
  },
  {
    title: "Sell and replenish",
    text: "Keep checkout and stock in sync automatically.",
  },
  {
    title: "Close with confidence",
    text: "Review sales, margins, and activity in one place.",
  },
];

export const plans = [
  {
    name: "Starter",
    tier: "starter",
    tone: "white",
    price: "Free",
    detail: "For getting your first workspace in order",
    features: ["100 products", "1 branch", "2 team members", "POS and stock tracking"],
  },
  {
    name: "Growth",
    tier: "growth",
    tone: "sun",
    price: "₦10,000",
    detail: "For businesses ready to move faster",
    features: ["1,000 products", "5 branches", "10 team members", "Reports and purchase orders"],
    featured: true,
  },
  {
    name: "Scale",
    tier: "scale",
    tone: "mint",
    price: "₦25,000",
    detail: "For multi-branch operations",
    features: ["Unlimited products", "Multiple branches", "Advanced permissions", "Priority support"],
  },
];

export const industries = ["Retail", "Hospitality", "Distribution", "Pharmacy", "Services"];

export const marqueeItems = Array.from({ length: 3 }, () => industries).flat();
