import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const RootLayout = () => {
  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        {/* Glow effect in background */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4267B2]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RootLayout;
