import { Card, CardBody, Spinner } from "@nextui-org/react";
import { BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, DollarSign, BarChart2 } from "lucide-react";
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
  Cell,
  Legend
} from "recharts";
import { useStats, useHealth } from "../../hooks/useAdmin";

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

  const summaryCards = [
    {
      label: "Total Revenue",
      value: `$${statsData?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-[#00D5FF]",
      bg: "bg-[#00D5FF]/10",
    },
    {
      label: "Successful Transactions",
      value: statsData?.successfulTransactions?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Service Types",
      value: pieData.length.toString(),
      icon: BarChart2,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-zinc-500">Real-time business metrics and performance insights.</p>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.label} className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
            <CardBody className="p-6 flex flex-row items-center gap-4">
              <div className={`p-3 rounded-2xl ${card.bg} border border-white/5`}>
                <card.icon size={22} className={card.color} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Revenue Bar Chart */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
          <CardBody className="p-8">
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <BarChart3 size={20} className="text-[#00D5FF]" /> Monthly Revenue
            </h3>
            <p className="text-xs text-zinc-500 mb-8">Revenue from successful bookings per month</p>
            {chartData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-zinc-600 text-sm">No revenue data yet</div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#ffffff05' }}
                      contentStyle={{ backgroundColor: 'rgba(24,24,27,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="total" fill="#4267B2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Service Pie Chart */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
          <CardBody className="p-8">
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <PieChartIcon size={20} className="text-[#00D5FF]" /> Service Distribution
            </h3>
            <p className="text-xs text-zinc-500 mb-8">Breakdown by booking type</p>
            {pieData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-zinc-600 text-sm">No booking data yet</div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(24,24,27,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Legend
                      formatter={(value) => <span className="text-zinc-400 text-sm">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* System Status Banner */}
      <Card className={`border backdrop-blur-2xl shadow-xl ${healthData?.status === 'Online' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <CardBody className="p-6 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${healthData?.status === 'Online' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <Activity size={22} className={healthData?.status === 'Online' ? "text-green-400" : "text-red-400"} />
            </div>
            <div>
              <p className={`font-bold text-lg ${healthData?.status === 'Online' ? 'text-green-400' : 'text-red-400'}`}>
                System {healthData?.status || 'Unknown'}
              </p>
              <p className="text-zinc-500 text-sm">
                {healthData?.status === 'Online' ? "All services running normally." : "Some services are experiencing issues."}{" "}
                {healthData?.system?.uptime ? `Uptime: ${healthData.system.uptime}` : ""}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${healthData?.status === 'Online' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {healthData?.status === 'Online' ? '● Live' : '● Degraded'}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
