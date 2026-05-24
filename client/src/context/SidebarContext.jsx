import { createContext, useState } from "react";

export const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ open, setOpen, mobileOpen, setMobileOpen, toggle: () => setOpen((p) => !p) }}>
      {children}
    </SidebarContext.Provider>
  );
};