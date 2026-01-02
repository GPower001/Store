import { Package } from "lucide-react";
import AdminInventoryBase from "../../../components/Admin/AdminInventoryBase";

const GeneralPage = () => {
  return (
    <AdminInventoryBase 
      category="General" 
      title="General Items Inventory" 
      icon={Package} 
    />
  );
};

export default GeneralPage;