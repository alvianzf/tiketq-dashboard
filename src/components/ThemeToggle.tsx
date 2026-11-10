import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative w-16 h-9 rounded-full border border-border bg-surface-hover transition-colors ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-8 h-8 rounded-full bg-surface shadow-md border border-border flex items-center justify-center transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? <Moon size={15} className="text-accent" /> : <Sun size={15} className="text-amber-500" />}
      </span>
    </button>
  );
};

export default ThemeToggle;
