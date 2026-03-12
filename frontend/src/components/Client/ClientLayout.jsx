import { useNavigate } from "react-router-dom";
import "../../styles/Client.css";
import Sidebar from "./SidebarC";
/*import Navbar from "./NavbarC";*/

export default function ClientLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        {/* <Navbar /> */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}