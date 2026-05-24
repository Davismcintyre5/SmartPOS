// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

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