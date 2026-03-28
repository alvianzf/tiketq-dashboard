import { Card, CardBody, Progress, Chip } from "@nextui-org/react";
import { Activity, Cpu, HardDrive, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useHealth } from "../hooks/useAdmin";

const SystemHealth = () => {
  const { data: health, isLoading } = useHealth();

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-white/5 border border-white/10 backdrop-blur-2xl animate-pulse">
          <CardBody className="p-6 h-[120px]" />
        </Card>
      ))}
    </div>
  );

  const isOnline = health?.status === "Online";
  const cpuPercent = health?.system?.cpuPercent ?? parseInt(health?.system?.cpu || "0");
  const memPercent = health?.system?.memPercent ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Status Card */}
      <Card className={`border backdrop-blur-2xl shadow-xl ${isOnline ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
        <CardBody className="p-6 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className={isOnline ? "text-green-400" : "text-red-400"} />
              <span className="text-sm font-medium text-zinc-400">System Status</span>
            </div>
            <Chip
              size="sm"
              variant="flat"
              className={isOnline ? "bg-green-500/10 text-green-400 border-none" : "bg-red-500/10 text-red-400 border-none"}
            >
              {health?.status || "Unknown"}
            </Chip>
          </div>
          <div className="space-y-2.5">
            {health?.services?.map((service, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">{service.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 font-mono">{service.latency}</span>
                  {service.status === "Healthy"
                    ? <CheckCircle size={12} className="text-green-400" />
                    : <AlertCircle size={12} className="text-red-400" />
                  }
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* CPU Card */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
        <CardBody className="p-6 gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Cpu size={18} />
            <span className="text-sm font-medium">CPU Load</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">1-min avg</span>
              <span className="text-white font-bold">{health?.system?.cpu || "—"}</span>
            </div>
            <Progress
              size="sm"
              value={cpuPercent}
              color={cpuPercent > 80 ? "danger" : cpuPercent > 50 ? "warning" : "primary"}
              className="max-w-md"
            />
          </div>
        </CardBody>
      </Card>

      {/* Memory Card */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
        <CardBody className="p-6 gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <HardDrive size={18} />
            <span className="text-sm font-medium">Memory</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500 truncate">{health?.system?.memory || "—"}</span>
              <span className="text-white font-bold ml-2">{memPercent > 0 ? `${memPercent}%` : ""}</span>
            </div>
            <Progress
              size="sm"
              value={memPercent}
              color={memPercent > 85 ? "danger" : memPercent > 65 ? "warning" : "secondary"}
              className="max-w-md"
            />
          </div>
        </CardBody>
      </Card>

      {/* Uptime Card */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
        <CardBody className="p-6 gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={18} />
            <span className="text-sm font-medium">Server Uptime</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {health?.system?.uptime || "—"}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
            Process running
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SystemHealth;
