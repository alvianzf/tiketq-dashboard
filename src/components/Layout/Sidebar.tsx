import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Car,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  Terminal,
  FileText,
  X,
  MapPin,
  Hotel,
  Compass
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import LogoMark from "../Logo/Mark";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: Props) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Overview", path: "/", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: Receipt },
    { name: "Private Driver", path: "/car-rental", icon: Car },
    { name: "Destinations", path: "/destinations", icon: MapPin },
    { name: "Hotels", path: "/hotels", icon: Hotel },
    { name: "Activities", path: "/activities", icon: Compass },
    { name: "Analytics", path: "/analytics", icon: TrendingUp },
    { name: "User Management", path: "/users", icon: Users },
    { name: "Server Manager", path: "/server", icon: Terminal },
    { name: "System Logs", path: "/logs", icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigate = () => {
    onClose();
  };

  return (
    <aside className={cn(
      "fixed lg:relative inset-y-0 left-0 z-30",
      "w-72 bg-sidebar border-r border-border flex flex-col p-6 h-screen",
      "transition-transform duration-300 ease-in-out",
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center gap-3 px-2 mb-10">
        <LogoMark className="h-10 w-10 shrink-0 shadow-lg shadow-brand/20" />
        <div className="flex flex-col flex-1">
          <span className="text-xl font-bold text-sidebar-foreground tracking-tight">
            TiketQ Hub
          </span>
          <span className="text-[10px] text-muted font-mono uppercase tracking-widest bg-surface-hover px-1.5 py-0.5 rounded border border-border w-fit mt-1">
            Admin Panel
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-muted hover:text-sidebar-foreground hover:bg-surface-hover transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-muted hover:text-sidebar-foreground hover:bg-surface-hover border border-transparent"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-brand" : "group-hover:text-sidebar-foreground")} />
              <span className="font-medium text-sm">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--primary)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-border space-y-2">
        <div className="px-4 py-3 mb-2 flex items-center gap-3 bg-surface-hover rounded-xl border border-border">
          <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center text-brand font-bold text-xs border border-brand/20 shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-sidebar-foreground truncate">{user?.username}</span>
            <span className="text-[10px] text-muted truncate">Administrator</span>
          </div>
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 text-muted hover:text-sidebar-foreground hover:bg-surface-hover rounded-xl transition-all text-sm font-medium">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
