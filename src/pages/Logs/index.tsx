import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardBody, 
  Button, 
  Spinner, 
  Input, 
  Switch, 
  ButtonGroup 
} from "@nextui-org/react";
import { 
  Terminal, 
  RefreshCw, 
  Copy, 
  Download, 
  Search, 
  FileText 
} from "lucide-react";
import { adminService } from "../../services/api";
import { toast } from "sonner";

const LogsPage = () => {
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "process" | "audit">("all");
  const logEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const data = await adminService.getLogs();
      setLogs(data);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to load system logs");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    toast.success("Logs copied to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([logs], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `tiketq_system_logs_${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Log file download started!");
  };

  // Filter & segment logs
  const processLogLines = () => {
    if (!logs) return [];
    
    const lines = logs.split("\n");
    let result: string[] = [];

    if (selectedTab === "all") {
      result = lines;
    } else if (selectedTab === "process") {
      let isProcessSection = false;
      for (const line of lines) {
        if (line.includes("SYSTEM BOOT & SERVER PROCESS LOGS")) {
          isProcessSection = true;
          continue;
        }
        if (line.includes("TRANSACTION EVENT AUDIT STREAM")) {
          isProcessSection = false;
        }
        if (isProcessSection) {
          result.push(line);
        }
      }
    } else if (selectedTab === "audit") {
      let isAuditSection = false;
      for (const line of lines) {
        if (line.includes("TRANSACTION EVENT AUDIT STREAM")) {
          isAuditSection = true;
          continue;
        }
        if (isAuditSection) {
          result.push(line);
        }
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(line => line.toLowerCase().includes(q));
    }

    return result;
  };

  const filteredLines = processLogLines();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto px-4 mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Terminal className="text-[#00D5FF]" size={24} />
            <h1 className="text-3xl font-bold text-white tracking-tight">System & Audit Logs</h1>
          </div>
          <p className="text-zinc-500 text-sm">Monitor real-time server process stdout stream and transaction event history.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl">
            <span className="text-xs text-zinc-400 font-medium">Auto-Refresh (5s)</span>
            <Switch 
              size="sm" 
              color="primary"
              isSelected={autoRefresh}
              onValueChange={setAutoRefresh}
            />
          </div>

          <Button 
            size="sm" 
            variant="flat" 
            className="bg-white/5 text-zinc-300 border border-white/10 h-10 px-4 font-bold"
            startContent={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
            onPress={() => fetchLogs(true)}
            isLoading={isRefreshing}
          >
            Refresh
          </Button>

          <Button 
            size="sm" 
            variant="flat" 
            className="bg-white/5 text-zinc-300 border border-white/10 h-10 px-4 font-bold"
            startContent={<Copy size={14} />}
            onPress={handleCopy}
          >
            Copy
          </Button>

          <Button 
            size="sm" 
            color="primary"
            className="font-bold shadow-lg shadow-blue-500/20 h-10 px-4"
            startContent={<Download size={14} />}
            onPress={handleDownload}
          >
            Export Log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-zinc-950 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden border-t-[#00D5FF]/20 border-t-2">
          <CardBody className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <ButtonGroup size="sm" variant="flat" className="bg-white/5 p-1 rounded-xl border border-white/5">
                <Button 
                  className={selectedTab === "all" ? "bg-white/10 text-white font-bold rounded-lg" : "text-zinc-500 font-medium"}
                  onPress={() => setSelectedTab("all")}
                >
                  All Logs
                </Button>
                <Button 
                  className={selectedTab === "process" ? "bg-white/10 text-white font-bold rounded-lg" : "text-zinc-500 font-medium"}
                  onPress={() => setSelectedTab("process")}
                >
                  Process Log
                </Button>
                <Button 
                  className={selectedTab === "audit" ? "bg-white/10 text-white font-bold rounded-lg" : "text-zinc-500 font-medium"}
                  onPress={() => setSelectedTab("audit")}
                >
                  Audit Stream
                </Button>
              </ButtonGroup>

              <Input
                size="sm"
                placeholder="Filter logs (e.g., AUDIT, PAID, LIO)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                classNames={{
                  inputWrapper: "bg-white/5 border-white/10 hover:bg-white/10 transition-colors w-72 h-10",
                  input: "text-zinc-300 text-xs"
                }}
                startContent={<Search size={14} className="text-zinc-500" />}
              />
            </div>

            {isLoading ? (
              <div className="flex flex-col h-[500px] items-center justify-center bg-black/30 border border-white/5 rounded-2xl">
                <Spinner size="lg" color="primary" />
                <p className="text-zinc-500 text-xs mt-3 font-mono">Loading developer console streams...</p>
              </div>
            ) : (
              <div className="border border-white/5 rounded-2xl overflow-hidden">
                <div className="bg-white/5 p-3 px-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <FileText size={12} className="text-[#00D5FF]" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                      {selectedTab === "all" ? "Combined Stream" : selectedTab === "process" ? "Process Output" : "Transaction Event Audit Stream"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-600 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      {filteredLines.length} Lines Rendered
                    </span>
                  </div>
                </div>

                <div className="h-[600px] bg-black/60 p-6 font-mono text-xs overflow-y-auto leading-6 select-text text-zinc-300 scrollbar-thin scrollbar-thumb-white/10">
                  <div className="space-y-1">
                    {filteredLines.map((line, i) => {
                      let colorClass = "text-zinc-400";
                      
                      if (line.includes("[AUDIT]")) {
                        colorClass = "text-emerald-400/90";
                      } else if (line.includes("Failed") || line.includes("error") || line.includes("failed") || line.includes("Error") || line.includes("[Redis Error]")) {
                        colorClass = "text-rose-400";
                      } else if (line.includes("=== ")) {
                        colorClass = "text-[#00D5FF] font-bold border-b border-[#00D5FF]/10 pb-1 mt-4 mb-2 block";
                      } else if (line.includes("successful") || line.includes("seeded")) {
                        colorClass = "text-green-400";
                      }

                      return (
                        <div key={i} className="flex gap-4 hover:bg-white/5 py-0.5 px-2 rounded transition-colors group">
                          <span className="w-8 text-[10px] text-zinc-700 select-none text-right opacity-40 group-hover:opacity-100">{i + 1}</span>
                          <span className={`${colorClass} flex-1 whitespace-pre-wrap`}>{line}</span>
                        </div>
                      );
                    })}
                    <div ref={logEndRef} className="w-1.5 h-3 bg-[#00D5FF] animate-pulse mt-2 ml-12" />
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LogsPage;
