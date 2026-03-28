import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody, Input, Button, CardHeader } from "@nextui-org/react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

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
      // Error handled by global interceptor, but we can add specific logic here if needed
      console.error("Login failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse duration-700" />
      
      <Card className="w-full max-w-md mx-4 bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl p-4">
        <CardHeader className="flex flex-col gap-1 pb-8 text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">TiketQ Admin</h1>
          <p className="text-zinc-500">Sign in to manage your ticketing empire</p>
        </CardHeader>
        
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              placeholder="Enter your username"
              variant="bordered"
              value={username}
              onValueChange={setUsername}
              startContent={<User size={18} className="text-zinc-400" />}
              classNames={{
                label: "text-zinc-400 pb-3",
                input: "text-white",
                inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500/50 bg-white/5",
              }}
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              variant="bordered"
              type={isVisible ? "text" : "password"}
              value={password}
              onValueChange={setPassword}
              startContent={<Lock size={18} className="text-zinc-400" />}
              endContent={
                <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeOff className="text-zinc-400" size={20} />
                  ) : (
                    <Eye className="text-zinc-400" size={20} />
                  )}
                </button>
              }
              classNames={{
                label: "text-zinc-400 pb-3",
                input: "text-white",
                inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500/50 bg-white/5",
              }}
            />

            <Button
              type="submit"
              color="primary"
              variant="shadow"
              className="w-full py-6 font-bold text-lg bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
              isLoading={isLoading}
            >
              Access Dashboard
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoginPage;
