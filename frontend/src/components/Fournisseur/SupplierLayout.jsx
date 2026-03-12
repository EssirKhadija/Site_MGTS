import { useNavigate } from "react-router-dom";
import "../../styles/Supplier.css";
import SupplierSidebar from "./SupplierSidebar";

export default function SupplierLayout({ children }) {
  return (
    <div className="app-shell">
      <SupplierSidebar />
      <div className="main-area">
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}