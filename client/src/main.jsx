// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

// Kill any existing service workers and caches
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((reg) => reg.unregister());
  });
  if (window.caches) {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <App />
          <Toaster position="top-right" />
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);