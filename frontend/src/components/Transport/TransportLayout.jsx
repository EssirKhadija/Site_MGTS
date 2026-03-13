import { useNavigate } from "react-router-dom";
import TransportSidebar from "../../components/Transport/TransportSidebar";

export default function TransportLayout({ children }) {
  return (
    <div className="app-shell">
      <TransportSidebar />
      <div className="main-area">
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}