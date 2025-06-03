import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar"; // Import Navbar
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      {/* Conditionally render Navbar */}
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation(); // Get the current route location

  // Define routes where the Navbar should NOT appear
  const hideNavbarRoutes = ["/dashboard", "/admin-dashboard"];

  // Check if the current route is in the hideNavbarRoutes array
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* Conditionally render Navbar */}
      {shouldShowNavbar && <Navbar />}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;