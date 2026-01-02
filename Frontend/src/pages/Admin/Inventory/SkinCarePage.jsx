import { Sparkles } from "lucide-react";
import AdminInventoryBase from "../../../components/Admin/AdminInventoryBase";

const SkinCarePage = () => {
  return (
    <AdminInventoryBase 
      category="Skin Care Products" 
      title="Skin Care Products Inventory" 
      icon={Sparkles} 
    />
  );
};

export default SkinCarePage;