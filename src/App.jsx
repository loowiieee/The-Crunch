import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Auth_Context";
import { CartProvider } from "./Cart_Context";
import Navbar from "./Nav_Bar";
import Home from "./Home";
import Menu from "./Menu";
import MyOrders from "./MyOrders";
import Auth from "./Auth";
import Cart from "./Cart";
import AdminPanel from "./Admin_Panel";
import OrderSuccess from "./OrderSuccess";
import ProtectedRoute from "./ProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";

const PageWrapper = ({ children }) => (
    <div style={{ paddingTop: "80px" }}>{children}</div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<PageWrapper><Menu /></PageWrapper>} />
              <Route path="/orders" element={<PageWrapper><MyOrders /></PageWrapper>} />
              <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
              <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><ProtectedRoute><AdminPanel /></ProtectedRoute></PageWrapper>} />
              <Route path="/order-success" element={<PageWrapper><OrderSuccess /></PageWrapper>} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;