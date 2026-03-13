import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import ValidatedOrders    from "./pages/Transport/ValidatedOrders";
import LogisticsFees      from "./pages/Transport/LogisticsFees";
import OperationsHistory  from "./pages/Transport/OperationsHistory";
import TransportMessages  from "./pages/Transport/TransportMessages";
import TransportProfile   from "./pages/Transport/TransportProfile";

import TransitaireLayout     from "./pages/Transitaire/TransitaireLayout";
import TransitaireDashboard  from "./pages/Transitaire/TransitaireDashboard";
import TransitaireOrders     from "./pages/Transitaire/TransitaireOrders";
import CustomsFees           from "./pages/Transitaire/CustomsFees";
import ImportValidation      from "./pages/Transitaire/ImportValidation";
import DossiersHistory       from "./pages/Transitaire/DossiersHistory";
import TransitaireMessages   from "./pages/Transitaire/TransitaireMessages";
import TransitaireProfile    from "./pages/Transitaire/TransitaireProfile";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/products" element={<ProductsC />} />
        <Route path="/new" element={<NewRequestC />} />
        <Route path="/quotes" element={<QuotesC />} />
        <Route path="/orders" element={<OrdersC />} />
        <Route path="/messages" element={<MessagesC />} />
        <Route path="/profile" element={<ProfileC />} />
        <Route path="/supplier" element={<SupplierDashboard />} />
        <Route path="/supplier/products" element={<SupplierProducts />} />
        <Route path="/supplier/demands" element={<SupplierDemands />} />
        <Route path="/supplier/orders" element={<SupplierOrders />} />
        <Route path="/supplier/messages" element={<SupplierMessages />} />
        <Route path="/supplier/profile" element={<SupplierProfile />} />
        <Route path="/transport" element={<TransportDashboard />} />
        <Route path="/transport/orders" element={<ValidatedOrders />} />
        <Route path="/transport/logistics" element={<LogisticsFees />} />
        <Route path="/transport/history" element={<OperationsHistory />} />
        <Route path="/transport/messages" element={<TransportMessages />} />
        <Route path="/transport/profile" element={<TransportProfile />} />

        <Route path="/transitaire" element={<TransitaireLayout />}>
          <Route index element={<TransitaireDashboard />} />
          <Route path="orders" element={<TransitaireOrders />} />
          <Route path="customs" element={<CustomsFees />} />
          <Route path="import" element={<ImportValidation />} />
          <Route path="history" element={<DossiersHistory />} />
          <Route path="messages" element={<TransitaireMessages />} />
          <Route path="profile" element={<TransitaireProfile />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;