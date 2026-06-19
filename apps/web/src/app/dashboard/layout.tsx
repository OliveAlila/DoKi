import DashboardAppShell from "@/components/layout/DashboardAppShell";
import React from "react";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DashboardAppShell>{children}</DashboardAppShell>;
};

export default DashboardLayout;
