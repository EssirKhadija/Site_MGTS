import AdminSidebar from "./AdminSidebar";
import "../../styles/Admin.css";

export default function AdminLayout({ children, badgeCounts }) {
  return (
    <div className="app-shell">
      <AdminSidebar />
      <div className="main-area">
        <div className="page-content">
          {children}
          
        </div>
      </div>
    </div>
  );
}
