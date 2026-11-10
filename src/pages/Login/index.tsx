import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "@nextui-org/react";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/Logo";
import LogoMark from "../../components/Logo/Mark";
import ThemeToggle from "../../components/ThemeToggle";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(username, password);
      toast.success("Welcome back!", {
        description: "You have successfully logged into the admin dashboard.",
      });
      navigate("/");
    } catch (err: unknown) {
      console.error("Login failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Brand panel — always on a colored background, so the white-text
          wordmark logo stays legible regardless of the page theme. */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#2f4f8a] via-[#4267b2] to-[#0ad1ff] p-12 flex-col justify-between">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#ff5a00]/20 rounded-full blur-[100px]" />

        <Logo className="relative h-10 w-auto" />

        <div className="relative flex flex-col gap-4 max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
            Run the Batam ⇄ Malaysia ⇄ Singapore concierge from one place.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Bookings, fleet, destinations, and live system health — everything your
            team needs to keep TiketQ running smoothly.
          </p>
        </div>

        <p className="relative text-white/50 text-xs">&copy; {new Date().getFullYear()} TiketQ. All rights reserved.</p>
      </div>

      {/* Form panel — theme-aware tokens, works in both light and dark. */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <LogoMark className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground tracking-tight">TiketQ Hub</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted text-sm mt-1">Sign in to manage your ticketing empire.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              placeholder="Enter your username"
              variant="bordered"
              value={username}
              onValueChange={setUsername}
              startContent={<User size={18} className="text-muted" />}
              classNames={{
                label: "text-muted pb-5",
                input: "text-foreground",
                inputWrapper: "border-border hover:border-brand/40 focus-within:!border-brand bg-surface",
              }}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              variant="bordered"
              type={isVisible ? "text" : "password"}
              value={password}
              onValueChange={setPassword}
              startContent={<Lock size={18} className="text-muted" />}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeOff className="text-muted" size={20} />
                  ) : (
                    <Eye className="text-muted" size={20} />
                  )}
                </button>
              }
              classNames={{
                label: "text-muted pb-5",
                input: "text-foreground",
                inputWrapper: "border-border hover:border-brand/40 focus-within:!border-brand bg-surface",
              }}
            />

            <Button
              type="submit"
              color="primary"
              variant="shadow"
              className="w-full py-6 font-bold text-base bg-brand text-white shadow-brand/20"
              isLoading={isLoading}
            >
              Access Dashboard
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
