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