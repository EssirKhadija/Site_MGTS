import { Outlet } from "react-router-dom";
import TransitaireSidebar from "../../components/Transitaire/TransitaireSidebar";

export default function TransitaireLayout() {
  return (
    <div className="app-shell">
      <TransitaireSidebar />
      <div className="main-area">
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
