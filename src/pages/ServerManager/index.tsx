import { useState, useEffect } from "react";
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
  Tooltip
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
  Github,
  ChevronLast
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
  status: string;
  monit: {
    memory: number;
    cpu: number;
  };
  pid: number;
}

const ServerManager = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [processes, setProcesses] = useState<PM2Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPM2, setIsRefreshingPM2] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [pm2Id, setPm2Id] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [rawCommand, setRawCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchFiles = async (path: string = "") => {
    setIsLoading(true);
    try {
      const data = await adminService.getServerFiles(path);
      setFiles(data);
      setCurrentPath(path);
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
    fetchFiles();
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 30000); 
    return () => clearInterval(interval);
  }, []);

  const handleFolderClick = (path: string) => {
    fetchFiles(path);
  };

  const handleFileView = async (file: ServerFile) => {
    try {
      const content = await adminService.getFileContent(file.path);
      setSelectedFileContent(content);
      setSelectedFileName(file.name);
      onOpen();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Failed to read file", { description: error.message });
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
    
    setLogs(prev => [...prev, `[INIT] Executing ${cmdLabel} ${contextStr} in /${currentPath}...`]);
    
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 mt-4 px-4 overflow-x-hidden">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-400" size={24} />
          <h1 className="text-3xl font-bold text-white tracking-tight">VPS Terminal Center</h1>
        </div>
        <p className="text-zinc-500">Global process monitoring, repository management and direct shell access</p>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <CardBody className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 shadow-inner">
                <Cpu size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white tracking-tight">Active Processes</h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">PM2 Lifecycle Manager</p>
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
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Process ID/Name</TableColumn>
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Status</TableColumn>
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-center">Load</TableColumn>
              <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-right px-6">Controls</TableColumn>
            </TableHeader>
            <TableBody emptyContent={isRefreshingPM2 ? "Searching system..." : "No managed processes found."}>
              {processes.map((proc, i) => (
                <TableRow key={i} className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0 hover:scale-[1.005] origin-left">
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
                      color={proc.status === 'online' ? 'success' : 'danger'}
                      className="capitalize font-bold text-[10px] shadow-sm border border-white/5"
                      startContent={proc.status === 'online' ? <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse mx-1" /> : null}
                    >
                      {proc.status}
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
                       <Tooltip content="Start Instance" color="success">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          onPress={() => executeCommand("pm2-start", proc.pm_id.toString())}
                          isDisabled={proc.status === 'online'}
                          isLoading={isExecuting}
                        >
                          <Play size={14} fill="currentColor" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Restart Instance" color="primary">
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
                      <Tooltip content="Stop Instance" color="warning">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                          onPress={() => executeCommand("pm2-stop", proc.pm_id.toString())}
                          isDisabled={proc.status !== 'online'}
                          isLoading={isExecuting}
                        >
                          <Square size={12} fill="currentColor" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete Configuration" color="danger">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat" 
                          className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          onPress={() => {
                            if(confirm(`Eradicate configuration for [${proc.name}]? This action deletes PM2 entry.`)) {
                              executeCommand("pm2-delete", proc.pm_id.toString());
                            }
                          }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <CardBody className="p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
                  <Terminal size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Maintenance Deck</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex gap-2">
                   <Input 
                    size="sm" 
                    placeholder="Git Repository URL" 
                    className="flex-1"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    classNames={{
                      input: "bg-transparent text-white truncate",
                      inputWrapper: "bg-white/5 border-white/10 group-data-[focus=true]:border-blue-500/50 h-10 text-xs"
                    }}
                    startContent={<Github size={14} className="text-zinc-500" />}
                  />
                  <Button 
                    variant="flat"
                    className="bg-[#00D5FF]/10 text-[#00D5FF] font-bold h-10 px-4 border border-[#00D5FF]/20"
                    onPress={() => executeCommand("git-clone")}
                    isLoading={isExecuting}
                  >
                    Clone
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    variant="flat" 
                    className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                    startContent={<Download size={16} className="text-[#00D5FF]" />}
                    onPress={() => executeCommand("git-pull")}
                    isLoading={isExecuting}
                  >
                    Git Pull
                  </Button>
                  <Button 
                    variant="flat" 
                    className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                    startContent={<RefreshCw size={16} className="text-orange-400" />}
                    onPress={() => executeCommand("git-restore")}
                    isLoading={isExecuting}
                  >
                    Git Restore
                  </Button>
                  <Button 
                    variant="flat" 
                    className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                    startContent={<Package size={16} className="text-green-400" />}
                    onPress={() => executeCommand("npm-install")}
                    isLoading={isExecuting}
                  >
                    NPM Install
                  </Button>
                  <Button 
                    variant="flat" 
                    className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                    startContent={<ArrowUpCircle size={16} className="text-purple-400" />}
                    onPress={() => executeCommand("npm-build")}
                    isLoading={isExecuting}
                  >
                    NPM Build
                  </Button>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-500/5 border border-blue-400/10 inline-flex w-full overflow-hidden">
                    <Search size={12} className="text-blue-400/70 shrink-0" />
                    <p className="text-[10px] text-zinc-500 font-mono truncate">
                      CWD: <span className="text-blue-300">/{currentPath || "root [project]"}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-white/5 flex gap-2">
                  <Input 
                    size="sm" 
                    placeholder="PM2 Name / ID" 
                    className="w-1/2"
                    value={pm2Id}
                    onChange={(e) => setPm2Id(e.target.value)}
                    classNames={{
                      input: "bg-transparent text-white",
                      inputWrapper: "bg-white/5 border-white/10 group-data-[focus=true]:border-blue-500/50 h-10 text-xs"
                    }}
                  />
                  <Button 
                    color="primary"
                    className="flex-1 font-bold shadow-lg shadow-blue-500/20 h-10 text-xs"
                    onPress={() => executeCommand("pm2-restart")}
                    isLoading={isExecuting}
                  >
                    Quick Restart
                  </Button>
                </div>
              </div>

              <div className="pt-6 mt-2 border-t border-white/5 space-y-3">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Prisma Orchestration</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm"
                    variant="flat" 
                    className="bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 h-10 font-bold text-[11px]"
                    startContent={<ShieldCheck size={14} className="text-blue-400" />}
                    onPress={() => executeCommand("prisma-generate")}
                    isLoading={isExecuting}
                  >
                    GENERATE
                  </Button>
                  <Button 
                    size="sm"
                    variant="flat" 
                    className="bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 h-10 font-bold text-[11px]"
                    startContent={<ArrowUpCircle size={14} className="text-green-400" />}
                    onPress={() => executeCommand("prisma-migrate")}
                    isLoading={isExecuting}
                  >
                    DEPLOY
                  </Button>
                  <Button 
                    size="sm"
                    variant="flat" 
                    className="bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5 h-10 font-bold text-[11px] col-span-2"
                    startContent={<RefreshCw size={14} className="text-orange-400" />}
                    onPress={() => executeCommand("prisma-push")}
                    isLoading={isExecuting}
                  >
                    SYNC DB PUSH
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-zinc-950 border-white/5 shadow-2xl border-t-2 border-t-green-500/20">
            <CardBody className="p-0">
              <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Global Build Logs</p>
                </div>
                <button 
                  onClick={() => setLogs([])} 
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Reset
                </button>
              </div>
              <div className="h-[400px] p-6 font-mono text-[11px] overflow-y-auto text-green-400/90 scrollbar-thin scrollbar-thumb-white/10 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]">
                {logs.length === 0 ? (
                  <div className="flex flex-col h-full items-center justify-center opacity-20 gap-2">
                    <Terminal size={40} className="text-zinc-600" />
                    <p className="italic text-zinc-500">System Link Active. Awaiting stream...</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 group">
                        <span className="text-zinc-700 shrink-0 select-none opacity-40 group-hover:opacity-100 transition-opacity">{(i+1).toString().padStart(3, '0')}</span>
                        <span className="break-all whitespace-pre-wrap">{log}</span>
                      </div>
                    ))}
                    <div className="w-2 h-4 bg-green-500 animate-pulse inline-block mt-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  </div>
                )}
              </div>
              <div className="p-1 px-4 bg-zinc-900/50 border-t border-white/5 flex gap-2 items-center">
                 <ChevronLast size={14} className="text-zinc-600" />
                 <Input 
                   size="sm" 
                   variant="underlined"
                   placeholder="Direct Shell Exec..."
                   className="flex-1"
                   value={rawCommand}
                   onChange={(e) => setRawCommand(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && executeCommand("raw")}
                   classNames={{
                     input: "text-zinc-300 font-mono text-xs",
                     innerWrapper: "bg-transparent"
                   }}
                 />
                 <Button 
                   size="sm" 
                   isIconOnly 
                   variant="light" 
                   className="text-zinc-500 hover:text-green-400"
                   onPress={() => executeCommand("raw")}
                   isLoading={isExecuting}
                 >
                   <Play size={14} />
                 </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: Project Explorer */}
        <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-inner">
                  <Folder size={20} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Project Navigator</h3>
              </div>
              
              <Breadcrumbs variant="light" size="sm" classNames={{ list: "gap-1" }}>
                <BreadcrumbItem onClick={() => handleFolderClick("")}>
                  <div className="p-1 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400">Root</div>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <BreadcrumbItem 
                    key={index} 
                    onClick={() => handleFolderClick(breadcrumbItems.slice(0, index + 1).join("/"))}
                  >
                    <div className="p-1 px-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-zinc-400">{item}</div>
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
                aria-label="Files"
                className="bg-transparent"
                removeWrapper
                selectionMode="single"
              >
                <TableHeader>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12">Resource Name</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12">Format</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12 text-right">Size</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12 text-right px-8">Action</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No data available in this directory segment."}>
                  {files.map((file, i) => (
                    <TableRow key={i} className="group hover:bg-white/5 transition-all border-b border-white/5 last:border-0 cursor-default">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${file.isDir ? "bg-[#00D5FF]/10 text-[#00D5FF]" : "bg-zinc-500/10 text-zinc-400"} shadow-inner`}>
                            {file.isDir ? <Folder size={16} /> : <FileText size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold tracking-tight ${file.isDir ? "text-white" : "text-zinc-300"}`}>
                              {file.name}
                            </span>
                            {file.hasPackageJson && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Package size={10} className="text-warning opacity-70" />
                                <span className="text-[9px] text-warning font-bold uppercase tracking-widest opacity-80">NPM ROOT</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-zinc-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {file.isDir ? "DIR" : file.name.split('.').pop()?.toUpperCase() || "BIN"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-zinc-500 font-mono">
                          {file.isDir ? "--" : `${(file.size / 1024).toFixed(1)} KB`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        {file.isDir ? (
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="flat"
                            className="bg-white/5 text-zinc-400 hover:text-white hover:bg-[#00D5FF]/20"
                            onPress={() => handleFolderClick(file.path)}
                          >
                            <ChevronRight size={18} />
                          </Button>
                        ) : (
                          <Button 
                            isIconOnly 
                            size="sm" 
                            variant="flat"
                            className="bg-white/5 text-zinc-400 hover:text-white hover:bg-blue-500/20"
                            onPress={() => handleFileView(file)}
                          >
                            <FileText size={18} />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="5xl"
        backdrop="blur" 
        scrollBehavior="inside"
        classNames={{
          base: "bg-zinc-950/95 border border-white/10 text-white shadow-2xl",
          header: "border-b border-white/5 py-6 px-10",
          body: "p-0",
          closeButton: "hover:bg-white/10 active:scale-95 transition-all text-zinc-500 m-4"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex gap-4 items-center">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
              <FileText size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">{selectedFileName}</span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5">Static Asset / Source Preview</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="bg-black/50 min-h-[500px] relative border-l border-white/5 mt-0.5">
              <div className="absolute top-0 left-0 w-12 h-full bg-white/5 border-r border-white/10 flex flex-col items-center pt-6 text-[10px] text-zinc-600 font-mono select-none">
                {selectedFileContent.split('\n').map((_, i) => (
                  <div key={i} className="h-5 leading-5">{i + 1}</div>
                ))}
              </div>
              <div className="pl-16 p-8 overflow-x-auto">
                <pre className="font-mono text-[13px] leading-6 text-zinc-300 selection:bg-blue-500/40">
                  {selectedFileContent || <span className="italic opacity-30">The requested resource contains no viewable text data.</span>}
                </pre>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ServerManager;
