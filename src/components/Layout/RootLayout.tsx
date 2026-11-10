import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PINNED_KEY = "tiketq-admin-sidebar-pinned";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pinned, setPinned] = useState(() => localStorage.getItem(PINNED_KEY) === "true");

  const togglePinned = () => {
    setPinned((prev) => {
      const next = !prev;
      localStorage.setItem(PINNED_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} pinned={pinned} onTogglePinned={togglePinned} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
