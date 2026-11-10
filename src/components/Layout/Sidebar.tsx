import { useState } from "react";
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
  Compass,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import LogoMark from "../Logo/Mark";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pinned: boolean;
  onTogglePinned: () => void;
}

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

const Sidebar = ({ isOpen, onClose, pinned, onTogglePinned }: Props) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // Icon rail by default: pin it open, or just hover to peek the labels.
  const expanded = pinned || hovered;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "fixed lg:relative inset-y-0 left-0 z-30",
        "bg-sidebar border-r border-border flex flex-col h-screen",
        "transition-[width,transform] duration-200 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-72",
        expanded ? "lg:w-72" : "lg:w-[72px]"
      )}
    >
      <div className={cn("flex items-center gap-3 mb-8 pt-6 px-4", !expanded && "lg:justify-center lg:px-0")}>
        <LogoMark className="h-9 w-9 shrink-0 shadow-lg shadow-brand/20" />
        <div className={cn("flex flex-col flex-1 min-w-0", !expanded && "lg:hidden")}>
          <span className="text-lg font-bold text-sidebar-foreground tracking-tight truncate">TiketQ Hub</span>
          <span className="text-[9px] text-muted font-mono uppercase tracking-widest bg-surface-hover px-1.5 py-0.5 rounded border border-border w-fit mt-1">
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

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              title={expanded ? undefined : item.name}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative overflow-hidden",
                !expanded && "lg:justify-center",
                isActive
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-muted hover:text-sidebar-foreground hover:bg-surface-hover border border-transparent"
              )}
            >
              <item.icon size={18} className={cn("shrink-0", isActive ? "text-brand" : "group-hover:text-sidebar-foreground")} />
              <span className={cn("font-medium text-sm truncate", !expanded && "lg:hidden")}>{item.name}</span>
              {isActive && expanded && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--primary)] shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-border p-3 space-y-1")}>
        <button
          onClick={onTogglePinned}
          title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
          className={cn(
            "hidden lg:flex w-full items-center gap-3 px-3 py-2 text-muted hover:text-sidebar-foreground hover:bg-surface-hover rounded-xl transition-all text-xs font-medium",
            !expanded && "justify-center"
          )}
        >
          {pinned ? <PinOff size={16} className="shrink-0" /> : <Pin size={16} className="shrink-0" />}
          <span className={cn(!expanded && "lg:hidden")}>{pinned ? "Unpin" : "Pin open"}</span>
        </button>

        <div className={cn("px-3 py-2.5 mb-1 flex items-center gap-3 bg-surface-hover rounded-xl border border-border", !expanded && "lg:justify-center lg:px-0")}>
          <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center text-brand font-bold text-xs border border-brand/20 shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className={cn("flex flex-col overflow-hidden", !expanded && "lg:hidden")}>
            <span className="text-sm font-medium text-sidebar-foreground truncate">{user?.username}</span>
            <span className="text-[10px] text-muted truncate">Administrator</span>
          </div>
        </div>

        <button
          title={expanded ? undefined : "Settings"}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-muted hover:text-sidebar-foreground hover:bg-surface-hover rounded-xl transition-all text-sm font-medium",
            !expanded && "lg:justify-center"
          )}
        >
          <Settings size={18} className="shrink-0" />
          <span className={cn(!expanded && "lg:hidden")}>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          title={expanded ? undefined : "Sign Out"}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all text-sm font-medium",
            !expanded && "lg:justify-center"
          )}
        >
          <LogOut size={18} className="shrink-0" />
          <span className={cn(!expanded && "lg:hidden")}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
