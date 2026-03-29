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
  Progress
} from "@nextui-org/react";
import { 
  Folder, 
  FileText, 
  Terminal, 
  Package,
  ArrowUpCircle,
  Download,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Cpu,
  Database,
  Play,
  PlayCircle,
  Edit,
  Save,
  Move,
  History,
  Activity,
  HardDrive,
  Clock
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

interface ServerHealth {
  cpu: { load: string; cores: number };
  memory: { total: string; used: string; free: string; percent: string };
  disk: { total: string; used: string; available: string; percent: string };
  uptime: string;
}

const STORAGE_KEY = "tiketq_admin_server_path";

const ServerManager = () => {
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "";
  });
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [processes, setProcesses] = useState<PM2Process[]>([]);
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPM2, setIsRefreshingPM2] = useState(false);
  
  const [editingContent, setEditingContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [logs, setLogs] = useState<string[]>([]);
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

  const fetchHealth = async () => {
    try {
      const data = await adminService.getServerHealth();
      setHealth(data);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
    fetchProcesses();
    fetchHealth();
    const interval = setInterval(() => {
      fetchProcesses();
      fetchHealth();
    }, 30000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.success("File saved successfully");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Save failed", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (path: string, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete [${name}]?`)) return;
    
    try {
      if (processes.some(p => p.name === name || p.pm_id.toString() === path)) {
         await adminService.executeServerCommand("pm2-delete", path);
      } else {
         await adminService.deleteServerFile(path);
      }
      toast.success("Item deleted");
      fetchFiles(currentPath);
      fetchProcesses();
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
    const targetId = idToUse !== undefined ? idToUse : "";
    
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
           <p className="text-xs italic">Adaptive session memory active (restored path: /{currentPath || 'root'})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PM2 Processes - 2/3 width */}
        <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden border-t-blue-500/20 border-t-2">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
                  <Activity size={18} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white tracking-tight">Active Processes</h3>
                  <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Lifecycle Manager</p>
                </div>
              </div>
              
              <Button 
                size="sm" 
                variant="flat" 
                className="bg-white/5 text-zinc-300 border border-white/10 h-8 px-4 font-bold text-[10px]"
                startContent={<RefreshCw size={12} className={isRefreshingPM2 ? "animate-spin" : ""} />}
                onPress={fetchProcesses}
                isLoading={isRefreshingPM2}
              >
                Sync
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
                <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-center">Load</TableColumn>
                <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-right">Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent={isRefreshingPM2 ? "Refreshing..." : "No active processes."}>
                {processes.map((proc, i) => (
                  <TableRow key={i} className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-mono text-blue-400 text-[10px] shadow-inner">
                          {proc.pm_id}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white truncate max-w-[120px]">{proc.name}</span>
                          <span className="text-[9px] text-zinc-500 font-mono">PID {proc.pid}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color={proc.pm2_env.status === 'online' ? 'success' : 'danger'}
                        className="capitalize font-bold text-[9px] h-5"
                      >
                        {proc.pm2_env.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-white">
                           <Cpu size={10} className="text-blue-500" /> {proc.monit.cpu}%
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-white">
                           <Database size={10} className="text-purple-500" /> {(proc.monit.memory / 1024 / 1024).toFixed(0)}MB
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                         <Button isIconOnly size="sm" variant="flat" className="bg-success/10 text-success hover:bg-success/20 h-7 w-7" onPress={() => executeCommand("pm2-start", proc.pm_id.toString())} isDisabled={proc.pm2_env.status === 'online'} isLoading={isExecuting}>
                           <Play size={10} fill="currentColor" />
                         </Button>
                         <Button isIconOnly size="sm" variant="flat" className="bg-primary/10 text-primary hover:bg-primary/20 h-7 w-7" onPress={() => executeCommand("pm2-restart", proc.pm_id.toString())} isLoading={isExecuting}>
                           <RefreshCw size={10} />
                         </Button>
                         <Button isIconOnly size="sm" variant="flat" className="bg-danger/10 text-danger hover:bg-danger/20 h-7 w-7" onPress={() => deleteItem(proc.pm_id.toString(), proc.name)} isLoading={isExecuting}>
                           <Trash2 size={10} />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* System Health - 1/3 width */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden border-t-green-500/20 border-t-2">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shadow-inner">
                <ShieldCheck size={18} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white tracking-tight">System Health</h3>
                <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">VPS Telemetry</p>
              </div>
            </div>

            {!health ? (
              <div className="flex flex-col items-center justify-center h-[200px] opacity-20">
                <RefreshCw size={32} className="animate-spin mb-2" />
                <p className="text-xs font-mono">Sampling infrastructure...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Cpu size={14} className="text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">CPU Utilization</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{health.cpu.load}%</span>
                  </div>
                  <Progress size="sm" color="primary" value={parseFloat(health.cpu.load)} className="max-w-md h-1.5" />
                  <p className="text-[8px] text-zinc-600 font-mono text-right italic">{health.cpu.cores} Physical Cores Active</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Database size={14} className="text-purple-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Memory Pressure</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{health.memory.percent}%</span>
                  </div>
                  <Progress size="sm" color="secondary" value={parseFloat(health.memory.percent)} className="max-w-md h-1.5" />
                  <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                     <span>{health.memory.used}MB USED</span>
                     <span>{health.memory.total}MB TOTAL</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <HardDrive size={14} className="text-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Root Storage</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{health.disk.percent}</span>
                  </div>
                  <Progress 
                    size="sm" 
                    color={parseInt(health.disk.percent) > 90 ? "danger" : "warning"} 
                    value={parseInt(health.disk.percent)} 
                    className="max-w-md h-1.5" 
                  />
                   <div className="flex justify-between text-[8px] text-zinc-600 font-mono">
                     <span>{health.disk.available} AVAILABLE</span>
                     <span>{health.disk.total} TOTAL</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-500" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Uptime</span>
                   </div>
                   <span className="text-xs font-mono font-bold text-green-400">{health.uptime} Hours</span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Project Explorer - 3/4 width */}
        <Card className="lg:col-span-3 bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl border-t-zinc-500/20 border-t-2">
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
                  <div className="p-1 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 cursor-pointer text-[10px]">ROOT</div>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <BreadcrumbItem 
                    key={index} 
                    onClick={() => handleFolderClick(breadcrumbItems.slice(0, index + 1).join("/"))}
                  >
                    <div className="p-1 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400 cursor-pointer text-[10px] uppercase">{item}</div>
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </div>

            <div className="min-h-[600px] border border-white/5 rounded-2xl bg-black/20 overflow-hidden relative">
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
              >
                <TableHeader>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12">Name</TableColumn>
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
                          <div className={`p-2 rounded-lg ${file.isDir ? "bg-[#00D5FF]/10 text-[#00D5FF]" : "bg-zinc-500/10 text-zinc-400"}`}>
                            {file.isDir ? <Folder size={14} /> : <FileText size={14} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white">{file.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button isIconOnly size="sm" variant="light" className="text-zinc-500 hover:text-white" onPress={() => file.isDir ? handleFolderClick(file.path) : handleFileView(file)}>
                            {file.isDir ? <RefreshCw size={12} /> : <Edit size={12} />}
                          </Button>
                          <Button isIconOnly size="sm" variant="light" className="text-zinc-500 hover:text-blue-400" onPress={() => moveItem(file.path, file.name)}>
                            <Move size={12} />
                          </Button>
                          <Button isIconOnly size="sm" variant="light" className="text-zinc-500 hover:text-red-400" onPress={() => deleteItem(file.path, file.name)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>

        {/* Maintenance Deck - 1/4 width */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden border-t-blue-500/20 border-t-2">
            <CardBody className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
                  <Terminal size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">Maintenance</h3>
              </div>

              <div className="space-y-4">
                 <div className="flex flex-col gap-2">
                    <Input 
                      size="sm" 
                      placeholder="Git URL for Clone"
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      classNames={{ inputWrapper: "bg-white/5 border-white/10 h-8 text-[11px]" }}
                    />
                    <Button size="sm" variant="flat" className="bg-blue-500/10 text-blue-400 font-bold" onPress={() => executeCommand("git-clone")} isLoading={isExecuting}>GENESIS CLONE</Button>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="flat" size="sm" className="bg-white/5 text-zinc-400 h-8 text-[10px]" startContent={<Download size={12} />} onPress={() => executeCommand("git-pull")} isLoading={isExecuting}>PULL</Button>
                    <Button variant="flat" size="sm" className="bg-white/5 text-zinc-400 h-8 text-[10px]" startContent={<RefreshCw size={12} />} onPress={() => executeCommand("git-restore")} isLoading={isExecuting}>RESET</Button>
                 </div>

                 <div className="space-y-2 pt-2">
                    <Button size="sm" variant="flat" className="bg-green-500/10 text-green-400 font-bold w-full" startContent={<Package size={14} />} onPress={() => executeCommand("npm-install")} isLoading={isExecuting}>NPM INSTALL</Button>
                    <Button size="sm" variant="flat" className="bg-purple-500/10 text-purple-400 font-bold w-full" startContent={<ArrowUpCircle size={14} />} onPress={() => executeCommand("npm-build")} isLoading={isExecuting}>DEPLOY BUILD</Button>
                 </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                 <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Prisma Deck</p>
                 <Button size="sm" variant="flat" className="bg-white/5 text-zinc-400 font-bold w-full text-[10px]" onPress={() => executeCommand("prisma-generate")} isLoading={isExecuting}>SCHEMA SYNC</Button>
                 <Button size="sm" variant="flat" className="bg-white/5 text-zinc-400 font-bold w-full text-[10px]" onPress={() => executeCommand("prisma-migrate")} isLoading={isExecuting}>DEPLOY MIGRATION</Button>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-zinc-950 border-white/5 shadow-2xl border-t-2 border-t-green-500/20">
            <CardBody className="p-0">
               <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Shell Console</span>
                  </div>
                  <button onClick={() => setLogs([])} className="text-[9px] text-zinc-700 hover:text-white">CLEAR</button>
               </div>
               <div className="h-[250px] p-4 font-mono text-[9px] overflow-y-auto text-green-400/80 bg-black/40">
                  <div className="space-y-1">
                    {logs.map((log, i) => <div key={i} className="flex gap-2"><span className="opacity-20">{i+1}</span>{log}</div>)}
                    <div ref={logEndRef} className="w-1.5 h-3 bg-green-500 animate-pulse mt-1" />
                  </div>
               </div>
               <div className="p-2 px-3 bg-zinc-900/50 border-t border-white/5 flex gap-2 items-center">
                  <PlayCircle size={12} className="text-zinc-600" />
                  <Input 
                    size="sm" 
                    variant="underlined" 
                    placeholder="Direct Shell Link..." 
                    className="flex-1"
                    value={rawCommand}
                    onChange={(e) => setRawCommand(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeCommand("raw")}
                    classNames={{ input: "text-zinc-400 font-mono text-[10px] h-6" }}
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
          header: "border-b border-white/5 py-4 px-8",
          body: "p-0",
          footer: "border-t border-white/5 p-4",
          closeButton: "hover:bg-white/10 text-zinc-500 m-4"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-4">
             <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                 <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
                   <FileText size={18} />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-lg font-bold text-white tracking-tight">{selectedFileName}</span>
                   <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Source Edit Mode</p>
                 </div>
               </div>
               <div className="pr-10">
                  <Button 
                    color="primary" 
                    size="sm" 
                    className="font-bold shadow-lg shadow-blue-500/20 h-8"
                    startContent={<Save size={14} />}
                    onPress={saveFile}
                    isLoading={isSaving}
                  >
                    COMMIT CHANGES
                  </Button>
               </div>
             </div>
             <div className="pt-4 mt-2 border-t border-white/5 flex gap-2">
                  <Input 
                    size="sm" 
                    placeholder="PM2 Name / ID" 
                    className="w-1/2"
                    classNames={{
                      input: "bg-transparent text-white",
                      inputWrapper: "bg-white/5 border-white/10 group-data-[focus=true]:border-blue-500/50 h-10 text-xs"
                    }}
                  />
                  <Button 
                    color="primary"
                    className="flex-1 font-bold shadow-lg shadow-blue-500/20 h-10 text-xs"
                    onPress={() => {
                        const input = document.querySelector('input[placeholder="PM2 Name / ID"]') as HTMLInputElement;
                        if (input) executeCommand("pm2-restart", input.value);
                    }}
                    isLoading={isExecuting}
                  >
                    Quick Restart
                  </Button>
                </div>
          </ModalHeader>
          <ModalBody>
            <div className="bg-black/90 min-h-[500px] relative group border-t border-white/5">
              <div className="absolute top-0 left-0 w-10 h-full bg-white/5 border-r border-white/10 flex flex-col items-center pt-6 text-[9px] text-zinc-700 font-mono select-none">
                {editingContent.split('\n').map((_, i) => (
                  <div key={i} className="h-5 leading-5">{i + 1}</div>
                ))}
              </div>
              <textarea
                className="w-full h-full bg-transparent pl-14 p-6 font-mono text-[12px] leading-5 text-zinc-300 outline-none resize-none min-h-[500px] scrollbar-thin scrollbar-thumb-white/10"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                spellCheck={false}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ServerManager;
