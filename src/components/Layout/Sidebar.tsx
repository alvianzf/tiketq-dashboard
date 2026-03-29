import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  Car, 
  Settings, 
  LogOut,
  TrendingUp,
  Users,
  Terminal
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: Receipt },
    { name: "Car Rental", path: "/car-rental", icon: Car },
    { name: "Analytics", path: "/analytics", icon: TrendingUp },
    { name: "User Management", path: "/users", icon: Users },
    { name: "Server Manager", path: "/server", icon: Terminal },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-zinc-950/40 border-r border-white/5 backdrop-blur-2xl flex flex-col p-6 h-screen">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-gradient-to-tr from-[#4267B2] to-[#00D5FF] rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
          TQ
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white tracking-tight">
            TiketQ Hub
          </span>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest bg-zinc-900/50 px-1.5 py-0.5 rounded border border-white/5 w-fit mt-1">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10" 
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon size={18} className={cn(
                isActive ? "text-[#00D5FF]" : "group-hover:text-zinc-200"
              )} />
              <span className="font-medium text-sm">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D5FF] shadow-[0_0_8px_#00D5FF]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-2">
        <div className="px-4 py-3 mb-2 flex items-center gap-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs border border-blue-500/20">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{user?.username}</span>
            <span className="text-[10px] text-zinc-500 truncate">Administrator</span>
          </div>
        </div>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-xl transition-all text-sm font-medium">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
