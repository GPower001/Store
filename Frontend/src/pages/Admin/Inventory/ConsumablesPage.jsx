import { ShoppingBag } from "lucide-react";
import AdminInventoryBase from "../../../components/Admin/AdminInventoryBase";

const ConsumablesPage = () => {
  return (
    <AdminInventoryBase 
      category="Consumables" 
      title="Consumables Inventory" 
      icon={ShoppingBag} 
    />
  );
};

export default ConsumablesPage;