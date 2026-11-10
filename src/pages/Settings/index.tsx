import { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { KeyRound, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/api";

const fieldClasses = {
  label: "text-muted font-medium pb-5",
  input: "text-foreground",
  inputWrapper: "border-border hover:border-brand/40 focus-within:!border-brand bg-surface",
};

const SettingsPage = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async () => {
    if (password.length < 6) {
      return toast.error("Password too short", { description: "Use at least 6 characters." });
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords don't match");
    }
    if (!user) return;

    setIsSaving(true);
    try {
      await adminService.updateUser(user.id, { password });
      toast.success("Password updated");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error("Failed to update password", { description: error.response?.data?.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted text-sm">Manage your own account.</p>
      </div>

      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <UserIcon size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Account</h2>
            <p className="text-xs text-muted">Signed in as {user?.username}</p>
          </div>
        </div>
      </div>

      <div className="surface-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
            <KeyRound size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Change Password</h2>
            <p className="text-xs text-muted">Update the password for this administrator account.</p>
          </div>
        </div>

        <Input
          label="New Password"
          placeholder="Enter a new password"
          variant="bordered"
          type={isVisible ? "text" : "password"}
          value={password}
          onValueChange={setPassword}
          endContent={
            <button className="focus:outline-none" type="button" onClick={() => setIsVisible((v) => !v)}>
              {isVisible ? <EyeOff className="text-muted" size={18} /> : <Eye className="text-muted" size={18} />}
            </button>
          }
          classNames={fieldClasses}
        />
        <Input
          label="Confirm New Password"
          placeholder="Re-enter the new password"
          variant="bordered"
          type={isVisible ? "text" : "password"}
          value={confirmPassword}
          onValueChange={setConfirmPassword}
          classNames={fieldClasses}
        />

        <Button
          color="primary"
          className="bg-brand text-white font-bold"
          isLoading={isSaving}
          onPress={handleChangePassword}
        >
          Update Password
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
