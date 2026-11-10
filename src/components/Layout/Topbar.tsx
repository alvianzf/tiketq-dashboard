import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Overview", subtitle: "Live snapshot of the TiketQ platform." },
  "/transactions": { title: "Transactions", subtitle: "Monitor and manage all customer bookings." },
  "/car-rental": { title: "Private Driver", subtitle: "Manage your fleet, pricing, and availability." },
  "/destinations": { title: "Destinations", subtitle: "Admin-managed catalog of ItinerQ destinations." },
  "/hotels": { title: "Hotels", subtitle: "Manage stays offered through the concierge platform." },
  "/activities": { title: "Activities", subtitle: "Manage bookable experiences and activities." },
  "/analytics": { title: "Analytics", subtitle: "Real-time business metrics and performance insights." },
  "/users": { title: "User Management", subtitle: "Manage administrative accounts and system access." },
  "/server": { title: "Server Manager", subtitle: "Monitor and control the backend process." },
  "/logs": { title: "System Logs", subtitle: "Process logs and the transaction audit stream." },
};

interface Props {
  onOpenSidebar: () => void;
}

const Topbar = ({ onOpenSidebar }: Props) => {
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname];

  return (
    <div className="sticky top-0 z-10 flex items-center gap-4 px-4 md:px-8 h-16 border-b border-border bg-background/80 ">
      <button
        className="lg:hidden p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-foreground truncate">{page?.title ?? "TiketQ Admin"}</h1>
        <p className="hidden sm:block text-xs text-muted truncate">{page?.subtitle}</p>
      </div>

      <ThemeToggle />
    </div>
  );
};

export default Topbar;
