import { Wrench } from "lucide-react";
import AdminInventoryBase from "../../../components/Admin/AdminInventoryBase";

const ApparatusPage = () => {
  return (
    <AdminInventoryBase 
      category="Apparatus" 
      title="Apparatus Inventory" 
      icon={Wrench} 
    />
  );
};

export default ApparatusPage;