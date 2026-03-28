import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  Car, 
  Settings, 
  LogOut,
  TrendingUp
} from "lucide-react";
import { cn } from "../../lib/utils.ts";

const Sidebar = () => {
  const { pathname } = useLocation();

  const menuItems = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: Receipt },
    { name: "Car Rental", path: "/car-rental", icon: Car },
    { name: "Analytics", path: "/analytics", icon: TrendingUp },
  ];

  return (
    <aside className="w-72 bg-zinc-950/50 border-r border-white/5 backdrop-blur-xl flex flex-col p-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-gradient-to-tr from-[#4267B2] to-[#00D5FF] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
          TQ
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          TiketQ Hub
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive 
                  ? "bg-white/10 text-white shadow-inner" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(
                isActive ? "text-[#00D5FF]" : "group-hover:text-zinc-200"
              )} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D5FF] shadow-[0_0_8px_#00D5FF]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-xl transition-all">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
