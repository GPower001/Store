import { Refrigerator } from "lucide-react";
import AdminInventoryBase from "../../../components/Admin/AdminInventoryBase";

const MedicationFridgePage = () => {
  return (
    <AdminInventoryBase 
      category="Stem cell" 
      title="Stem Cell" 
      icon={Refrigerator} 
    />
  );
};

export default MedicationFridgePage;