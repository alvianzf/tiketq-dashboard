import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  Button,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Spinner,
} from "@nextui-org/react";
import { UserPlus, Shield, Trash2, Edit3, Key, User as UserIcon, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/api";
import type { User as UserType } from "../../services/AuthService";

// Separate modal components for Add and Edit
const AddUserModal = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: adminService.registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Administrator Created", {
        description: `Account for ${username} has been successfully created.`,
      });
      setUsername("");
      setPassword("");
      onOpenChange();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ username, password });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      classNames={{
        base: "bg-zinc-900/90 border border-white/10 backdrop-blur-3xl shadow-2xl",
        header: "text-white border-b border-white/5 px-8 pt-8 pb-6",
        body: "py-6 px-8",
        footer: "border-t border-white/5 px-8 pb-8 pt-6 gap-3",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <UserPlus size={20} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Administrator</h2>
                <p className="text-sm text-zinc-500 font-normal mt-0.5">Create a new dashboard user account.</p>
              </div>
            </ModalHeader>
            <ModalBody className="gap-5">
              <Input
                autoFocus
                label="Username"
                placeholder="Enter administrator username"
                variant="bordered"
                value={username}
                onValueChange={setUsername}
                startContent={<UserIcon size={16} className="text-zinc-500" />}
                classNames={{
                  label: "text-zinc-400 font-medium pb-2",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500/60 bg-white/5",
                }}
              />
              <Input
                label="Password"
                placeholder="Set a temporary password"
                type="password"
                variant="bordered"
                value={password}
                onValueChange={setPassword}
                startContent={<Key size={16} className="text-zinc-500" />}
                classNames={{
                  label: "text-zinc-400 font-medium pb-2",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500/60 bg-white/5",
                }}
              />
              <div className="flex items-center gap-2 px-1 py-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <Shield size={14} className="text-blue-400 shrink-0" />
                <span className="text-xs text-zinc-500">All accounts created here receive Administrator privileges.</span>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose} className="text-zinc-400 bg-white/5 border border-white/10 flex-1 h-11 font-medium">Cancel</Button>
              <Button
                color="primary"
                type="submit"
                isLoading={registerMutation.isPending}
                className="bg-blue-600 font-bold shadow-lg shadow-blue-600/20 flex-1 h-11"
              >
                Create Account
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

const EditUserModal = ({
  user,
  isOpen,
  onClose,
}: {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  // Reset form when user changes or modal opens
  React.useEffect(() => {
    if (user && isOpen) {
      setUsername(user.username);
      setPassword("");
    }
  }, [user, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Account Updated", {
        description: `Administrator details have been saved.`,
      });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { username };
    if (password) payload.password = password;
    updateMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      backdrop="blur"
      classNames={{
        base: "bg-zinc-900/90 border border-white/10 backdrop-blur-3xl shadow-2xl",
        header: "text-white border-b border-white/5 px-8 pt-8 pb-6",
        body: "py-6 px-8",
        footer: "border-t border-white/5 px-8 pb-8 pt-6 gap-3",
      }}
    >
      <ModalContent>
        {() => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Edit3 size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Administrator</h2>
                <p className="text-sm text-zinc-500 font-normal mt-0.5">Update credentials and access levels.</p>
              </div>
            </ModalHeader>
            <ModalBody className="gap-5">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-sm border border-blue-500/20">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user?.username}</p>
                  <p className="text-zinc-500 text-xs">ID: {user?.id}</p>
                </div>
                {user?.isAdmin && (
                  <Chip size="sm" className="ml-auto bg-blue-500/10 text-blue-400 border-none text-xs">Admin</Chip>
                )}
              </div>
              <Input
                autoFocus
                label="Username"
                placeholder="Enter new username"
                variant="bordered"
                value={username}
                onValueChange={setUsername}
                startContent={<UserIcon size={16} className="text-zinc-500" />}
                classNames={{
                  label: "text-zinc-400 font-medium pb-2",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-amber-500/60 bg-white/5",
                }}
              />
              <Input
                label="New Password"
                placeholder="Leave blank to keep current password"
                type="password"
                variant="bordered"
                value={password}
                onValueChange={setPassword}
                startContent={<Key size={16} className="text-zinc-500" />}
                classNames={{
                  label: "text-zinc-400 font-medium pb-2",
                  input: "text-white",
                  inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-amber-500/60 bg-white/5",
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose} className="text-zinc-400 bg-white/5 border border-white/10 flex-1 h-11 font-medium">Cancel</Button>
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                className="bg-amber-600 text-white font-bold shadow-lg shadow-amber-600/20 flex-1 h-11"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

const UsersPage = () => {
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: adminService.getUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User Deleted", {
        description: "The administrative account has been removed.",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this administrator? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-zinc-500">Manage administrative accounts and system access.</p>
        </div>
        <Button
          onPress={onAddOpen}
          variant="shadow"
          startContent={<UserPlus size={18} />}
          className="bg-blue-600 text-white font-bold h-12 px-6 shadow-blue-600/20"
        >
          Add Administrator
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts", value: users?.length ?? 0, color: "text-white" },
          { label: "Administrators", value: users?.filter(u => u.isAdmin).length ?? 0, color: "text-blue-400" },
          { label: "Regular Users", value: users?.filter(u => !u.isAdmin).length ?? 0, color: "text-zinc-300" },
          { label: "Active Today", value: users?.length ?? 0, color: "text-green-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white/5 border border-white/10 backdrop-blur-2xl">
            <CardBody className="p-4">
              <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <CardBody className="p-0">
          <Table
            aria-label="User management table"
            removeWrapper
            classNames={{
              base: "max-h-[600px] overflow-scroll",
              th: "bg-white/5 text-zinc-400 border-b border-white/5 py-4 font-bold uppercase text-xs tracking-wider",
              td: "py-4 text-zinc-300 border-b border-white/5 last:border-0",
            }}
          >
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No users found">
              {(users || []).map((user: UserType) => (
                <TableRow key={user.id} className="hover:bg-white/5 transition-colors">
                  <TableCell>
                    <User
                      name={user.username}
                      description={`ID: ${user.id}`}
                      avatarProps={{
                        src: `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=3b82f6&textColor=ffffff`,
                        className: "border border-white/10",
                      }}
                      classNames={{
                        name: "text-white font-medium",
                        description: "text-zinc-500",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isAdmin
                        ? <Shield size={14} className="text-blue-400" />
                        : <ShieldOff size={14} className="text-zinc-600" />}
                      <span className="text-sm">{user.isAdmin ? "Administrator" : "User"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-500">
                      {/* @ts-expect-error — createdAt may exist at runtime */}
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
                      <span className="text-xs font-medium text-green-400">Active</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Tooltip content="Edit user" showArrow>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          onPress={() => setEditingUser(user)}
                          className="bg-white/5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 border border-white/5 transition-all"
                        >
                          <Edit3 size={15} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete user" color="danger" showArrow>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          isLoading={deleteMutation.isPending}
                          onPress={() => handleDelete(user.id)}
                          className="bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 transition-all"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <AddUserModal isOpen={isAddOpen} onOpenChange={onAddOpenChange} />
      <EditUserModal user={editingUser} isOpen={!!editingUser} onClose={() => setEditingUser(null)} />
    </div>
  );
};

export default UsersPage;
