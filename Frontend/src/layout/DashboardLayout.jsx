import { Outlet } from "react-router-dom";
import Nav from "../components/Navbar";

import SideBar2 from "../components/Sidebar2";
import BackToTop from "../components/BackToTop"


const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-[100vw]">
      <SideBar2 />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Nav />
        <BackToTop/> 
        <main className="p-6 overflow-y-auto">
        <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
