import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/login";
import Signup from "./pages/Signup";
import ClientDashboard from "./pages/Client/ClientDashboard";
import ProductsC from "./pages/Client/ProductsC";
import NewRequestC from "./pages/Client/NewRequestC";
import QuotesC from "./pages/Client/QuotesC";
import OrdersC from "./pages/Client/OrdersC";
import MessagesC from "./pages/Client/MessagesC";
import ProfileC from "./pages/Client/ProfileC";
import SupplierDashboard from "./pages/Fournisseur/SupplierDashboard";
import SupplierProducts from "./pages/Fournisseur/SupplierProducts";
import SupplierDemands from "./pages/Fournisseur/SupplierDemands";
import SupplierOrders from "./pages/Fournisseur/SupplierOrders";
import SupplierMessages from "./pages/Fournisseur/SupplierMessages";
import SupplierProfile from "./pages/Fournisseur/SupplierProfile";
import TransportDashboard from "./pages/Transport/TransportDashboard";
import ValidatedOrders from "./pages/Transport/ValidatedOrders";
import LogisticsFees from "./pages/Transport/LogisticsFees";
import OperationsHistory from "./pages/Transport/OperationsHistory";
import TransportMessages from "./pages/Transport/TransportMessages";
import TransportProfile from "./pages/Transport/TransportProfile";
import TransitaireLayout from "./pages/Transitaire/TransitaireLayout";
import TransitaireDashboard from "./pages/Transitaire/TransitaireDashboard";
import TransitaireOrders from "./pages/Transitaire/TransitaireOrders";
import CustomsFees from "./pages/Transitaire/CustomsFees";
import ImportValidation from "./pages/Transitaire/ImportValidation";
import DossiersHistory from "./pages/Transitaire/DossiersHistory";
import TransitaireMessages from "./pages/Transitaire/TransitaireMessages";
import TransitaireProfile from "./pages/Transitaire/TransitaireProfile";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PaymentsCommissions from "./pages/Admin/PaymentsCommissions";
import UsersManagement from "./pages/Admin/UsersManagement";
import OrdersSupervision from "./pages/Admin/OrdersSupervision";
import ExportsExcel from "./pages/Admin/ExportsExcel";
import SettingsAdmin from "./pages/Admin/SettingsAdmin";

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
};

// ── Animated Routes ───────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Client */}
        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute roles={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute roles={["client"]}>
              <ProductsC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute roles={["client"]}>
              <NewRequestC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes"
          element={
            <ProtectedRoute roles={["client"]}>
              <QuotesC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["client"]}>
              <OrdersC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute roles={["client"]}>
              <MessagesC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["client"]}>
              <ProfileC />
            </ProtectedRoute>
          }
        />

        {/* Supplier */}
        <Route
          path="/supplier"
          element={
            <ProtectedRoute roles={["supplier"]}>
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/products"
          element={
            <ProtectedRoute roles={["supplier"]}>
              <SupplierProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/demands"
          element={
            <ProtectedRoute roles={["supplier"]}>
              <SupplierDemands />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/orders"
          element={
            <ProtectedRoute roles={["supplier"]}>
              <SupplierOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/messages"
          element={
            <ProtectedRoute roles={["supplier"]}>
              <SupplierMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/profile"
          element={
            <ProtectedRoute roles={["supplier"]}>
              <SupplierProfile />
            </ProtectedRoute>
          }
        />

        {/* Transport */}
        <Route
          path="/transport"
          element={
            <ProtectedRoute roles={["transport"]}>
              <TransportDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport/orders"
          element={
            <ProtectedRoute roles={["transport"]}>
              <ValidatedOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport/logistics"
          element={
            <ProtectedRoute roles={["transport"]}>
              <LogisticsFees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport/history"
          element={
            <ProtectedRoute roles={["transport"]}>
              <OperationsHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport/messages"
          element={
            <ProtectedRoute roles={["transport"]}>
              <TransportMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transport/profile"
          element={
            <ProtectedRoute roles={["transport"]}>
              <TransportProfile />
            </ProtectedRoute>
          }
        />

        {/* Transitaire */}
        <Route
          path="/transitaire"
          element={
            <ProtectedRoute roles={["transitaire"]}>
              <TransitaireLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TransitaireDashboard />} />
          <Route path="orders" element={<TransitaireOrders />} />
          <Route path="customs" element={<CustomsFees />} />
          <Route path="import" element={<ImportValidation />} />
          <Route path="history" element={<DossiersHistory />} />
          <Route path="messages" element={<TransitaireMessages />} />
          <Route path="profile" element={<TransitaireProfile />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PaymentsCommissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/supplier"
          element={
            <ProtectedRoute roles={["admin"]}>
              <UsersManagement initialRole="fournisseur" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transport"
          element={
            <ProtectedRoute roles={["admin"]}>
              <UsersManagement initialRole="transporteur" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute roles={["admin"]}>
              <OrdersSupervision />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/exports"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ExportsExcel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SettingsAdmin />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// ── App ───────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
