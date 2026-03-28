import { Card, CardBody, Progress, Chip } from "@nextui-org/react";
import { Activity, ShieldCheck, Cpu, HardDrive, Clock } from "lucide-react";
import { useHealth } from "../hooks/useAdmin.ts";

const SystemHealth = () => {
  const { data: health, isLoading } = useHealth();

  if (isLoading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md">
        <CardBody className="p-6 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <Activity size={18} />
              <span className="text-sm font-medium">System Status</span>
            </div>
            <Chip color="success" variant="flat" size="sm" className="bg-green-500/10 text-green-400 border-none">
              {health?.status}
            </Chip>
          </div>
          <div className="space-y-3">
            {health?.services.map((service, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">{service.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 font-mono">{service.latency}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${service.status === 'Healthy' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400 shadow-[0_0_8px_#f87171]'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md">
        <CardBody className="p-6 gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Cpu size={18} />
            <span className="text-sm font-medium">CPU Usage</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Node Cluster</span>
              <span className="text-white font-bold">{health?.system.cpu}</span>
            </div>
            <Progress size="sm" value={parseInt(health?.system.cpu || '0')} color="primary" className="max-w-md" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md">
        <CardBody className="p-6 gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <HardDrive size={18} />
            <span className="text-sm font-medium">Memory Allocation</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">{health?.system.memory} used</span>
              <span className="text-white font-bold">30%</span>
            </div>
            <Progress size="sm" value={30} color="secondary" className="max-w-md" />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md">
        <CardBody className="p-6 gap-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={18} />
            <span className="text-sm font-medium">Server Uptime</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {health?.system?.uptime || 'N/A'}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <ShieldCheck size={12} className="text-green-500" />
            Security patches up to date
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SystemHealth;
