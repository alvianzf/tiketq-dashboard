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
  Input
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
  Search
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

const ServerManager = () => {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<ServerFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [pm2Id, setPm2Id] = useState("");
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

  useEffect(() => {
    fetchFiles();
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

  const executeCommand = async (action: string) => {
    if (action === "pm2-restart" && !pm2Id) {
      return toast.error("Please enter a PM2 Process ID");
    }

    setIsExecuting(true);
    const cmdLabel = action.replace("-", " ").toUpperCase();
    setLogs(prev => [...prev, `[INIT] Running ${cmdLabel} in /${currentPath}...`]);
    
    try {
      const result = await adminService.executeServerCommand(action, pm2Id, currentPath);
      
      if (result.stdout) {
        const lines = result.stdout.split('\n').filter((l: string) => l.trim());
        setLogs(prev => [...prev, ...lines]);
      }
      
      if (result.stderr) {
        setLogs(prev => [...prev, `[ERROR-STDOUT]: ${result.stderr}`]);
      }
      
      if (result.exitCode === 0) {
        toast.success(`${cmdLabel} completed successfully`);
        setLogs(prev => [...prev, `[SUCCESS] ${cmdLabel} finished with exit code 0.`]);
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-400" size={24} />
          <h1 className="text-3xl font-bold text-white tracking-tight">Server Management</h1>
        </div>
        <p className="text-zinc-500">Filesystem explorer and maintenance console</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Command Console */}
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
                <Button 
                  variant="flat" 
                  className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                  startContent={<Download size={18} className="text-[#00D5FF]" />}
                  onPress={() => executeCommand("git-pull")}
                  isLoading={isExecuting}
                >
                  Git Pull Updates
                </Button>
                <Button 
                  variant="flat" 
                  className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                  startContent={<RefreshCw size={18} className="text-orange-400" />}
                  onPress={() => executeCommand("git-restore")}
                  isLoading={isExecuting}
                >
                  Git Restore Files
                </Button>
                <Button 
                  variant="flat" 
                  className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                  startContent={<Package size={18} className="text-green-400" />}
                  onPress={() => executeCommand("npm-install")}
                  isLoading={isExecuting}
                >
                  NPM Install
                </Button>
                <Button 
                  variant="flat" 
                  className="justify-start h-12 bg-white/5 text-zinc-300 hover:bg-white/10 transition-all font-medium border border-white/5"
                  startContent={<ArrowUpCircle size={18} className="text-purple-400" />}
                  onPress={() => executeCommand("npm-build")}
                  isLoading={isExecuting}
                >
                  Build Production
                </Button>

                <div className="pt-2 px-1">
                  <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-blue-500/5 border border-blue-500/10 inline-flex w-full overflow-hidden">
                    <Search size={10} className="text-blue-400 shrink-0" />
                    <p className="text-[10px] text-zinc-400 font-mono truncate">
                      CWD: <span className="text-blue-300">/{currentPath || "root"}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-white/5 flex gap-2">
                  <Input 
                    size="sm" 
                    placeholder="Process ID (e.g. 0)" 
                    className="w-1/2"
                    value={pm2Id}
                    onChange={(e) => setPm2Id(e.target.value)}
                    classNames={{
                      input: "bg-transparent text-white",
                      inputWrapper: "bg-white/5 border-white/10 group-data-[focus=true]:border-blue-500/50 h-10"
                    }}
                  />
                  <Button 
                    color="primary"
                    className="flex-1 font-bold shadow-lg shadow-blue-500/20 h-10"
                    onPress={() => executeCommand("pm2-restart")}
                    isLoading={isExecuting}
                    startContent={!isExecuting && <RefreshCw size={14} />}
                  >
                    PM2 Restart
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
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Build & System Logs</p>
                </div>
                <button 
                  onClick={() => setLogs([])} 
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Clear Terminal
                </button>
              </div>
              <div className="h-[400px] p-6 font-mono text-[11px] overflow-y-auto text-green-400/90 scrollbar-thin scrollbar-thumb-white/10">
                {logs.length === 0 ? (
                  <div className="flex flex-col h-full items-center justify-center opacity-20 gap-2">
                    <Terminal size={40} className="text-zinc-600" />
                    <p className="italic text-zinc-500">Terminal ready. Waiting for input...</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 group">
                        <span className="text-zinc-700 shrink-0 select-none opacity-50 group-hover:opacity-100 transition-opacity">{(i+1).toString().padStart(3, '0')}</span>
                        <span className="break-all whitespace-pre-wrap">{log}</span>
                      </div>
                    ))}
                    <div className="w-2 h-4 bg-green-500 animate-pulse inline-block mt-2" />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: File Explorer */}
        <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-inner">
                  <Folder size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Project Explorer</h3>
              </div>
              
              <Breadcrumbs variant="light" size="sm" classNames={{ list: "gap-1" }}>
                <BreadcrumbItem onClick={() => handleFolderClick("")}>
                  <div className="p-1 px-2 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">Root</div>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <BreadcrumbItem 
                    key={index} 
                    onClick={() => handleFolderClick(breadcrumbItems.slice(0, index + 1).join("/"))}
                  >
                    <div className="p-1 px-2 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">{item}</div>
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </div>

            <div className="min-h-[600px] border border-white/5 rounded-2xl bg-black/20 overflow-hidden relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm bg-black/20">
                  <Spinner size="lg" color="warning" />
                </div>
              ) : null}

              <Table 
                aria-label="Files"
                className="bg-transparent"
                removeWrapper
                selectionMode="single"
              >
                <TableHeader>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12">Name</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12">Type</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12 text-right">Size</TableColumn>
                  <TableColumn className="bg-white/5 border-b border-white/10 text-zinc-500 text-[10px] font-bold uppercase tracking-widest h-12 text-right">Action</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No files found in this directory"}>
                  {files.map((file, i) => (
                    <TableRow key={i} className="group hover:bg-white/5 transition-all border-b border-white/10 last:border-0 cursor-default">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${file.isDir ? "bg-[#00D5FF]/10 text-[#00D5FF]" : "bg-zinc-500/10 text-zinc-400"} group-hover:scale-110 transition-transform`}>
                            {file.isDir ? <Folder size={16} /> : <FileText size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-semibold tracking-tight ${file.isDir ? "text-white" : "text-zinc-300"}`}>
                              {file.name}
                            </span>
                            {file.hasPackageJson && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Package size={10} className="text-warning" />
                                <span className="text-[9px] text-warning font-bold uppercase tracking-widest">NPM Root</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-zinc-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {file.isDir ? "DIR" : file.name.split('.').pop()?.toUpperCase() || "FILE"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs text-zinc-500 font-mono">
                          {file.isDir ? "--" : `${(file.size / 1024).toFixed(1)} KB`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
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

      {/* File Viewer Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="5xl"
        backdrop="blur" 
        scrollBehavior="inside"
        classNames={{
          base: "bg-zinc-950 border border-white/10 text-white shadow-2xl",
          header: "border-b border-white/5 py-4",
          body: "p-0",
          closeButton: "hover:bg-white/10 active:scale-95 transition-all"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex gap-3 items-center px-8">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">{selectedFileName}</span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Source Preview</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="bg-black/40 min-h-[400px] border-l border-white/5 relative">
              <div className="absolute top-0 left-0 w-12 h-full bg-white/5 border-r border-white/5 flex flex-col items-center pt-6 text-[10px] text-zinc-600 font-mono select-none">
                {selectedFileContent.split('\n').map((_, i) => (
                  <div key={i} className="h-5 leading-5">{i + 1}</div>
                ))}
              </div>
              <div className="pl-16 p-6 overflow-x-auto">
                <pre className="font-mono text-[12px] leading-5 text-zinc-300 selection:bg-blue-500/30">
                  {selectedFileContent || <span className="italic opacity-50">File is empty or contains binary data.</span>}
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
import { ShieldCheck } from "lucide-react"; 
