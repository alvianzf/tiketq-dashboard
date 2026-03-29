import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardBody, 
  Button, 
  Spinner, 
  Breadcrumbs, 
  BreadcrumbItem,
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Input,
  Tooltip,
  Textarea
} from "@nextui-org/react";
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  Terminal, 
  Package,
  ArrowUpCircle,
  Download,
  RefreshCw,
  Search,
  ShieldCheck,
  Square,
  Trash2,
  Cpu,
  Database,
  Play,
  PlayCircle,
  Edit,
  Save,
  Move,
  History
} from "lucide-react";
import { adminService } from "../../services/api";
import { toast } from "sonner";

interface ServerFile {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modifiedAt: string;
  hasPackageJson: boolean;
}

interface PM2Process {
  pm_id: number;
  name: string;
  pm2_env: {
    status: string;
  };
  monit: {
    memory: number;
    cpu: number;
  };
  pid: number;
}

const STORAGE_KEY = "tiketq_admin_server_path";

const ServerManager = () => {
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "";
  });
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [processes, setProcesses] = useState<PM2Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPM2, setIsRefreshingPM2] = useState(false);
  
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [logs, setLogs] = useState<string[]>([]);
  const [pm2Id, setPm2Id] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [rawCommand, setRawCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchFiles = async (path: string = currentPath) => {
    setIsLoading(true);
    try {
      const data = await adminService.getServerFiles(path);
      setFiles(data);
      setCurrentPath(path);
      localStorage.setItem(STORAGE_KEY, path);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      toast.error("Failed to load files", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProcesses = async () => {
    setIsRefreshingPM2(true);
    try {
      const data = await adminService.getPm2Processes();
      setProcesses(data || []);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to fetch PM2 processes");
    } finally {
      setIsRefreshingPM2(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 30000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleFolderClick = (path: string) => {
    fetchFiles(path);
  };

  const handleFileView = async (file: ServerFile) => {
    try {
      const content = await adminService.getFileContent(file.path);
      setSelectedFileContent(content);
      setEditingContent(content);
      setSelectedFileName(file.name);
      setSelectedFilePath(file.path);
      onOpen();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Failed to read file", { description: error.message });
    }
  };

  const saveFile = async () => {
    setIsSaving(true);
    try {
      await adminService.saveServerFile(selectedFilePath, editingContent);
      setSelectedFileContent(editingContent);
      toast.success("File saved successfully");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Save failed", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (path: string, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete [${name}]? This action cannot be undone.`)) return;
    
    try {
      await adminService.deleteServerFile(path);
      toast.success("Item deleted");
      fetchFiles(currentPath);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Delete failed", { description: error.message });
    }
  };

  const moveItem = async (path: string, currentName: string) => {
    const newName = prompt(`Move or Rename [${currentName}] to:`, path);
    if (!newName || newName === path) return;
    
    try {
      await adminService.moveServerFile(path, newName);
      toast.success("Item moved");
      fetchFiles(currentPath);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Move failed", { description: error.message });
    }
  };

  const executeCommand = async (action: string, idToUse?: string, extra?: { url?: string; command?: string }) => {
    const targetId = idToUse !== undefined ? idToUse : pm2Id;
    
    if (action.startsWith("pm2-") && targetId === "") {
      return toast.error("Please enter a PM2 Process ID or Name");
    }

    if (action === "git-clone" && !gitUrl) {
      return toast.error("Please enter a Git URL");
    }

    if (action === "raw" && !rawCommand) {
      return toast.error("Please enter a custom command");
    }

    setIsExecuting(true);
    const cmdLabel = action.replace("-", " ").toUpperCase();
    const contextStr = action === "raw" ? (extra?.command || "") : (targetId || "");
    
    setLogs(prev => [...prev, `[INIT] Executing ${cmdLabel} ${contextStr} in /${currentPath || 'root'}...`]);
    
    try {
      const result = await adminService.executeServerCommand(
        action, 
        targetId, 
        currentPath, 
        action === "git-clone" ? { url: gitUrl } : (action === "raw" ? { command: rawCommand } : undefined)
      );
      
      if (result.stdout) {
        const lines = result.stdout.split('\n').filter((l: string) => l.trim());
        setLogs(prev => [...prev, ...lines]);
      }
      
      if (result.stderr) {
        setLogs(prev => [...prev, `[STDERR]: ${result.stderr}`]);
      }
      
      if (result.exitCode === 0) {
        toast.success(`${cmdLabel} successful`);
        setLogs(prev => [...prev, `[SUCCESS] ${cmdLabel} finished with exit code 0.`]);
        if (action.startsWith("pm2-")) fetchProcesses(); 
        if (action === "git-clone") { setGitUrl(""); fetchFiles(currentPath); }
        if (action === "raw") setRawCommand("");
      } else {
        toast.error(`${cmdLabel} failed`);
        setLogs(prev => [...prev, `[FAIL] ${cmdLabel} failed with exit code ${result.exitCode}.`]);
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Execution failed", { description: error.message });
      setLogs(prev => [...prev, `[CRITICAL] System Error: ${error.message}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  const breadcrumbItems = currentPath.split("/").filter(p => p);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-4 px-4 overflow-x-hidden max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-400" size={24} />
          <h1 className="text-3xl font-bold text-white tracking-tight">Infrastructure Hub</h1>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
           <History size={14} className="text-orange-400/70" />
           <p className="text-xs italic">Adaptive session memory active (restoring from last session)</p>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden border-t-blue-500/20 border-t-2">
        <CardBody className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shadow-inner">
                <Cpu size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white tracking-tight">Process Dashboard</h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">VPS Monitor</p>
              </div>
            </div>
            
            <Button 
              size="sm" 
              variant="flat" 
              className="bg-white/5 text-zinc-300 border border-white/10 h-10 px-6 font-bold"
              startContent={<RefreshCw size={14} className={isRefreshingPM2 ? "animate-spin" : ""} />}
              onPress={fetchProcesses}
              isLoading={isRefreshingPM2}
            >
              Sync Matrix
            </Button>
          </div>

          <Table 
            aria-label="PM2 Processes"
            className="bg-transparent"
            removeWrapper
          >
            <TableHeader>
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">ID / Name</TableColumn>
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Status</TableColumn>
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-center">Resources</TableColumn>
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-right px-6">Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent={isRefreshingPM2 ? "Scanning segments..." : "Matrix idle."}>
              {processes.map((proc, i) => (
                <TableRow key={i} className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0 origin-left">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-mono text-blue-400 text-xs shadow-inner">
                        {proc.pm_id}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-tight">{proc.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">PID {proc.pid}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      color={proc.pm2_env.status === 'online' ? 'success' : 'danger'}
                      className="capitalize font-bold text-[10px] shadow-sm border border-white/5"
                      startContent={proc.pm2_env.status === 'online' ? <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse mx-1" /> : null}
                    >
                      {proc.pm2_env.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-zinc-300">
                          <Cpu size={12} className="text-blue-400 opacity-70" />
                          <span className="text-xs font-mono font-bold tracking-tighter">{proc.monit.cpu}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-zinc-300">
                          <Database size={12} className="text-purple-400 opacity-70" />
                          <span className="text-xs font-mono font-bold tracking-tighter">{(proc.monit.memory / 1024 / 1024).toFixed(1)}MB</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-2">
                       <Tooltip content="Start" color="success">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          onPress={() => executeCommand("pm2-start", proc.pm_id.toString())}
                          isDisabled={proc.pm2_env.status === 'online'}
                          isLoading={isExecuting}
                        >
                          <Play size={14} fill="currentColor" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Restart" color="primary">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                          onPress={() => executeCommand("pm2-restart", proc.pm_id.toString())}
                          isLoading={isExecuting}
                        >
                          <RefreshCw size={14} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Stop" color="warning">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                          onPress={() => executeCommand("pm2-stop", proc.pm_id.toString())}
                          isDisabled={proc.pm2_env.status !== 'online'}
                          isLoading={isExecuting}
                        >
                          <Square size={12} fill="currentColor" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete" color="danger">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          onPress={() => deleteItem(proc.pm_id.toString(), proc.name)}
                          isLoading={isExecuting}
                        >
                          <Trash2 size={12} />
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Project Explorer - Larger now */}
        <Card className="lg:col-span-3 bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl border-t-orange-500/20 border-t-2">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-inner">
                  <Folder size={20} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">System Navigator</h3>
              </div>
              
              <Breadcrumbs variant="light" size="sm" classNames={{ list: "gap-1" }}>
                <BreadcrumbItem onClick={() => handleFolderClick("")}>
                  <div className="p-1 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 cursor-pointer">Root</div>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <BreadcrumbItem 
                    key={index} 
                    onClick={() => handleFolderClick(breadcrumbItems.slice(0, index + 1).join("/"))}
                  >
                    <div className="p-1 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 cursor-pointer">{item}</div>
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </div>

            <div className="min-h-[700px] border border-white/5 rounded-2xl bg-black/20 overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm bg-black/20">
                  <Spinner size="lg" color="warning" />
                </div>
              )}

              <Table 
                aria-label="Filesystem"
                className="bg-transparent"
                removeWrapper
                selectionMode="single"
                classNames={{
                   tr: "cursor-default select-none"
                }}
              >
                <TableHeader>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12">Name</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12">Type</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12 text-right px-8">Actions</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"Segment is empty."}>
                  {files.map((file, i) => (
                    <TableRow 
                      key={i} 
                      className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0"
                      onDoubleClick={() => file.isDir ? handleFolderClick(file.path) : handleFileView(file)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${file.isDir ? "bg-[#00D5FF]/10 text-[#00D5FF]" : "bg-zinc-500/10 text-zinc-400"} shadow-inner`}>
                            {file.isDir ? <Folder size={16} /> : <FileText size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold tracking-tight ${file.isDir ? "text-white" : "text-zinc-300"}`}>
                              {file.name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-zinc-600 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {file.isDir ? "FOLDER" : file.name.split('.').pop()?.toUpperCase() || "UNIT"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip content="Edit / View" size="sm">
                             <Button isIconOnly size="sm" variant="light" className="text-zinc-500 hover:text-white" onPress={() => file.isDir ? handleFolderClick(file.path) : handleFileView(file)}>
                               {file.isDir ? <ChevronRight size={16} /> : <Edit size={14} />}
                             </Button>
                          </Tooltip>
                          <Tooltip content="Rename / Move" size="sm" color="primary">
                             <Button isIconOnly size="sm" variant="light" className="text-zinc-500 hover:text-blue-400" onPress={() => moveItem(file.path, file.name)}>
                               <Move size={14} />
                             </Button>
                          </Tooltip>
                          <Tooltip content="Delete permanently" size="sm" color="danger">
                             <Button isIconOnly size="sm" variant="light" className="text-zinc-500 hover:text-red-400" onPress={() => deleteItem(file.path, file.name)}>
                               <Trash2 size={14} />
                             </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>

        {/* Console & Maintenance */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden border-t-purple-500/20 border-t-2">
            <CardBody className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
                  <Terminal size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Maintenance</h3>
              </div>

              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <Input 
                      size="sm" 
                      placeholder="Repository Link"
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      classNames={{ inputWrapper: "bg-white/5 border-white/10 h-10" }}
                      startContent={<History size={14} className="text-zinc-500" />}
                    />
                    <Button variant="flat" className="bg-blue-500/10 text-blue-400 font-bold h-10" onPress={() => executeCommand("git-clone")} isLoading={isExecuting}>CLONE REPO</Button>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="flat" size="sm" className="bg-white/5 text-zinc-400 h-10" startContent={<Download size={14} />} onPress={() => executeCommand("git-pull")} isLoading={isExecuting}>PULL</Button>
                    <Button variant="flat" size="sm" className="bg-white/5 text-zinc-400 h-10" startContent={<RefreshCw size={14} />} onPress={() => executeCommand("git-restore")} isLoading={isExecuting}>RESET</Button>
                 </div>

                 <div className="flex flex-col gap-2 py-2">
                    <p className="text-[10px] text-zinc-600 font-mono tracking-tighter truncate px-1">ROOT: <span className="text-blue-500">/{currentPath || 'vps'}</span></p>
                    <Button variant="flat" className="bg-green-500/10 text-green-400 font-bold h-10" startContent={<Package size={16} />} onPress={() => executeCommand("npm-install")} isLoading={isExecuting}>NPM INSTALL</Button>
                    <Button variant="flat" className="bg-purple-500/10 text-purple-400 font-bold h-10" startContent={<ArrowUpCircle size={16} />} onPress={() => executeCommand("npm-build")} isLoading={isExecuting}>PRODUCTION BUILD</Button>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1 opacity-50">Database Engine</p>
                 <div className="flex flex-col gap-2">
                    <Button size="sm" variant="flat" className="bg-white/5 text-zinc-400 font-bold" onPress={() => executeCommand("prisma-generate")} isLoading={isExecuting}>PRISMA GENERATE</Button>
                    <Button size="sm" variant="flat" className="bg-white/5 text-zinc-400 font-bold" onPress={() => executeCommand("prisma-migrate")} isLoading={isExecuting}>PRISMA MIGRATE</Button>
                 </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-zinc-950 border-white/5 shadow-2xl border-t-2 border-t-green-500/20">
            <CardBody className="p-0">
               <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                     <span className="text-[10px] font-bold text-zinc-500 uppercase">Static Console</span>
                  </div>
                  <button onClick={() => setLogs([])} className="text-[10px] text-zinc-600 hover:text-white transition-colors">CLS</button>
               </div>
               <div className="h-[300px] p-6 font-mono text-[10px] overflow-y-auto text-green-400/80 bg-black/40">
                  {logs.length === 0 ? <p className="opacity-20 italic">Link secured. Direct shell active.</p> : null}
                  <div className="space-y-1">
                    {logs.map((log, i) => <div key={i} className="flex gap-2"><span className="opacity-30">{i+1}</span>{log}</div>)}
                    <div ref={logEndRef} className="w-1.5 h-3 bg-green-500 animate-pulse mt-1" />
                  </div>
               </div>
               <div className="p-2 px-4 bg-zinc-900/50 border-t border-white/5 flex gap-2 items-center">
                  <PlayCircle size={14} className="text-zinc-600" />
                  <Input 
                    size="sm" 
                    variant="underlined" 
                    placeholder="Raw Command..." 
                    className="flex-1"
                    value={rawCommand}
                    onChange={(e) => setRawCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeCommand("raw")}
                    classNames={{ input: "text-zinc-300 font-mono text-[11px]" }}
                  />
               </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="5xl"
        backdrop="blur" 
        scrollBehavior="inside"
        classNames={{
          base: "bg-zinc-950 border border-white/10 text-white shadow-2xl",
          header: "border-b border-white/5 py-6 px-10",
          body: "p-0",
          footer: "border-t border-white/5 p-4",
          closeButton: "hover:bg-white/10 text-zinc-500 m-4"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-4">
               <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                 <FileText size={22} />
               </div>
               <div className="flex flex-col">
                 <span className="text-xl font-bold text-white tracking-tight">{selectedFileName}</span>
                 <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Application Context / Source Stream</span>
               </div>
             </div>
             <div className="pr-12">
                <Button 
                  color="primary" 
                  size="sm" 
                  className="font-bold shadow-lg shadow-blue-500/20"
                  startContent={<Save size={16} />}
                  onPress={saveFile}
                  isLoading={isSaving}
                >
                  SAVE CHANGES
                </Button>
             </div>
          </ModalHeader>
          <ModalBody>
            <div className="bg-black/80 min-h-[600px] relative mt-0.5 group">
              <div className="absolute top-0 left-0 w-12 h-full bg-white/5 border-r border-white/10 flex flex-col items-center pt-8 text-[10px] text-zinc-700 font-mono select-none">
                {editingContent.split('\n').map((_, i) => (
                  <div key={i} className="h-6 leading-6">{i + 1}</div>
                ))}
              </div>
              <textarea
                className="w-full h-full bg-transparent pl-16 p-8 font-mono text-[13px] leading-6 text-zinc-300 outline-none resize-none min-h-[600px] scrollbar-thin scrollbar-thumb-white/10"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                spellCheck={false}
              />
              <div className="absolute bottom-4 right-4 text-[10px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                UTF-8 | LF | {selectedFileName.split('.').pop()?.toUpperCase() || 'UNIT'}
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ServerManager;
