import { useState, useRef, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, CornerDownLeft } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

const PAGES = [
  { title: "Overview", subtitle: "Live snapshot of the TiketQ platform.", path: "/" },
  { title: "Transactions", subtitle: "Monitor and manage all customer bookings.", path: "/transactions" },
  { title: "Private Driver", subtitle: "Manage your fleet, pricing, and availability.", path: "/car-rental" },
  { title: "Destinations", subtitle: "Admin-managed catalog of ItinerQ destinations.", path: "/destinations" },
  { title: "Hotels", subtitle: "Manage stays offered through the concierge platform.", path: "/hotels" },
  { title: "Activities", subtitle: "Manage bookable experiences and activities.", path: "/activities" },
  { title: "Analytics", subtitle: "Real-time business metrics and performance insights.", path: "/analytics" },
  { title: "User Management", subtitle: "Manage administrative accounts and system access.", path: "/users" },
  { title: "Server Manager", subtitle: "Monitor and control the backend process.", path: "/server" },
  { title: "System Logs", subtitle: "Process logs and the transaction audit stream.", path: "/logs" },
];

const PAGE_BY_PATH = Object.fromEntries(PAGES.map((p) => [p.path, p]));

interface Props {
  onOpenSidebar: () => void;
}

const Topbar = ({ onOpenSidebar }: Props) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = PAGE_BY_PATH[pathname];
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PAGES.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const goTo = (path: string) => {
    navigate(path);
    setQuery("");
    inputRef.current?.blur();
  };

  // Cmd/Ctrl+K focuses the search — standard command-bar convention.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showDropdown = focused && matches.length > 0;

  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 px-4 md:px-8 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <button
        className="lg:hidden p-2 -ml-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="hidden sm:block min-w-0 shrink-0">
        <h1 className="text-sm font-bold text-foreground truncate">{page?.title ?? "TiketQ Admin"}</h1>
        <p className="hidden md:block text-xs text-muted truncate">{page?.subtitle}</p>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={(e) => e.key === "Enter" && matches[0] && goTo(matches[0].path)}
            placeholder="Jump to a page..."
            className="w-full h-9 pl-9 pr-14 rounded-lg bg-surface border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-brand/50 transition-colors"
          />
          <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 rounded border border-border text-[10px] font-mono text-muted bg-surface-hover">
            ⌘K
          </kbd>

          {showDropdown && (
            <div className="absolute top-11 left-0 right-0 bg-surface border border-border rounded-xl shadow-xl overflow-hidden py-1 z-20">
              {matches.map((m, i) => (
                <button
                  key={m.path}
                  onMouseDown={() => goTo(m.path)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-surface-hover transition-colors"
                >
                  <span className="text-sm text-foreground font-medium truncate">{m.title}</span>
                  {i === 0 && <CornerDownLeft size={12} className="text-muted shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ThemeToggle className="shrink-0" />
    </div>
  );
};

export default Topbar;
