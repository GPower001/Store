import { Pill } from "lucide-react";
import AdminInventoryBase from "../../../components/Admin/AdminInventoryBase";

const MedicationsPage = () => {
  return (
    <AdminInventoryBase 
      category="Medications" 
      title="Medications Inventory" 
      icon={Pill} 
    />
  );
};

export default MedicationsPage;