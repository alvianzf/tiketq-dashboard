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
  Spinner
} from "@nextui-org/react";
import { UserPlus, Shield, Trash2, Edit3, Key, User as UserIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/api";

const UsersPage = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: adminService.getUsers,
  });

  const registerMutation = useMutation({
    mutationFn: adminService.registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setUsername("");
      setPassword("");
      onOpenChange();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ username, password });
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-zinc-500">Manage administrative access and system permissions.</p>
        </div>
        <Button 
          color="primary" 
          variant="shadow"
          startContent={<UserPlus size={18} />}
          onPress={onOpen}
          className="bg-blue-600 font-bold"
        >
          Add Administrator
        </Button>
      </div>

      <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md overflow-hidden">
        <CardBody className="p-0">
          <Table 
            aria-label="User management table"
            removeWrapper
            classNames={{
              th: "bg-white/5 text-zinc-400 border-b border-white/5 py-4",
              td: "py-4 text-zinc-300 border-b border-white/5",
            }}
          >
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>CREATED AT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn align="center">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No users found">
              {(users || []).map((user: any) => (
                <TableRow key={user.id} className="hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <User
                      name={user.username}
                      description={`ID: ${user.id}`}
                      avatarProps={{
                        src: `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=3b82f6`,
                        className: "border border-white/10"
                      }}
                      classNames={{
                        name: "text-white font-medium",
                        description: "text-zinc-500"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={user.isAdmin ? "text-blue-500" : "text-zinc-500"} />
                      <span className="text-sm">{user.isAdmin ? "Administrator" : "User"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="success" className="bg-green-500/10 text-green-400">
                      Active
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="relative flex items-center justify-center gap-2">
                      <Tooltip content="Edit user">
                        <button className="text-lg text-zinc-400 cursor-pointer active:opacity-50 hover:text-white transition-colors">
                          <Edit3 size={18} />
                        </button>
                      </Tooltip>
                      <Tooltip color="danger" content="Delete user">
                        <button 
                          onClick={() => deleteMutation.mutate(user.id)}
                          className="text-lg text-red-400 cursor-pointer active:opacity-50 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add User Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur"
        classNames={{
          base: "bg-zinc-900 border border-white/10",
          header: "text-white border-b border-white/5",
          body: "py-6",
          footer: "border-t border-white/5"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleRegister}>
              <ModalHeader>Add New Administrator</ModalHeader>
              <ModalBody className="gap-6">
                <Input
                  autoFocus
                  label="Username"
                  placeholder="Enter administrator username"
                  variant="bordered"
                  value={username}
                  onValueChange={setUsername}
                  startContent={<UserIcon size={18} className="text-zinc-400" />}
                  classNames={{
                    label: "text-zinc-400",
                    input: "text-white",
                    inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500",
                  }}
                />
                <Input
                  label="Password"
                  placeholder="Enter temporary password"
                  type="password"
                  variant="bordered"
                  value={password}
                  onValueChange={setPassword}
                  startContent={<Key size={18} className="text-zinc-400" />}
                  classNames={{
                    label: "text-zinc-400",
                    input: "text-white",
                    inputWrapper: "border-white/10 hover:border-white/20 focus-within:!border-blue-500",
                  }}
                />
                <div className="flex items-center gap-2 px-1">
                  <Shield size={16} className="text-blue-500" />
                  <span className="text-xs text-zinc-500 font-medium italic">
                    All new users created here will have Administrative privileges.
                  </span>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-zinc-400">
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  type="submit"
                  isLoading={registerMutation.isPending}
                  className="bg-blue-600 font-bold"
                >
                  Create Account
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UsersPage;
