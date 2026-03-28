import { Card, CardBody, Button, Spinner } from "@nextui-org/react";
import { BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useStats, useHealth } from "../../hooks/useAdmin.ts";

const AnalyticsPage = () => {
  const { data: statsData, isLoading: statsLoading } = useStats();
  const { data: healthData, isLoading: healthLoading } = useHealth();

  if (statsLoading || healthLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const chartData = statsData?.chartData || [];
  const pieData = statsData?.serviceDistribution || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-zinc-500">Deep dive into your business metrics and user behavior.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md">
          <CardBody className="p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <BarChart3 className="text-[#00D5FF]" /> Monthly Revenue Growth
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  <Bar dataKey="total" fill="#4267B2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md">
          <CardBody className="p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <PieChartIcon className="text-[#00D5FF]" /> Service Distribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center flex-wrap gap-4 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-400 text-sm whitespace-nowrap">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md p-6">
        <CardBody className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${healthData?.status === 'Online' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <Activity className={healthData?.status === 'Online' ? "text-green-500" : "text-red-500"} />
            </div>
            <div>
              <p className={`font-bold text-lg ${healthData?.status === 'Online' ? 'text-green-500' : 'text-red-500'}`}>
                System {healthData?.status}
              </p>
              <p className="text-zinc-500">
                {healthData?.status === 'Online' ? "All services are running normally." : "Some services are experiencing issues."} Uptime: {healthData?.system.uptime}
              </p>
            </div>
          </div>
          <Button variant="flat" color={healthData?.status === 'Online' ? "success" : "danger"} className="font-bold">
            View Detailed Stats
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
