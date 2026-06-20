import { useState, useEffect, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopNav from "../components/admin/AdminTopNav";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "14px", padding: "12px 16px", fontSize: "14px", fontWeight: 500 },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminTopNav
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
      />
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />

      <main
        className={`pt-20 min-h-screen transition-all duration-300 overflow-x-hidden
          ${sidebarCollapsed ? "ml-[114px]" : "ml-72"}
          max-lg:ml-0`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
