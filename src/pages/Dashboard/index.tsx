import { Card, CardBody, Spinner, Button } from "@nextui-org/react";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Car,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { useStats } from "../../hooks/useAdmin";
import SystemHealth from "../../components/SystemHealth";

const DashboardPage = () => {
  const { data: statsData, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const successRate = statsData && statsData.totalTransactions > 0
    ? `${((statsData.successfulTransactions / statsData.totalTransactions) * 100).toFixed(1)}% success rate`
    : "—";

  const stats = [
    { title: "Total Revenue", value: `Rp ${Number(statsData?.totalRevenue || 0).toLocaleString('id-ID')}`, change: statsData?.growth || "—", trend: "up", icon: CreditCard, color: "text-blue-500" },
    { title: "Successful Txns", value: statsData?.successfulTransactions?.toString() || '0', change: successRate, trend: "up", icon: Users, color: "text-[#00D5FF]" },
    { title: "Total Bookings", value: statsData?.totalTransactions?.toString() || '0', change: "all time", trend: "up", icon: TrendingUp, color: "text-green-500" },
    { title: "Available Cars", value: statsData?.activeCars?.toString() || '0', change: "in fleet", trend: "up", icon: Car, color: "text-orange-500" },
  ];

  const chartData = statsData?.chartData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <p className="text-zinc-500">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* System Health Section */}
      <SystemHealth />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend === "up" ? "bg-green-500/10 text-green-400 border border-green-500/10" : "bg-red-500/10 text-red-400 border border-red-500/10"}`}>
                  {stat.change}
                  {stat.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Revenue Performance</h3>
                <p className="text-zinc-500 text-sm">Monthly growth and volume trends</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                <Button size="sm" variant="light" className="text-white text-xs font-bold">Monthly</Button>
                <Button size="sm" variant="flat" className="text-zinc-500 text-xs font-bold">Annually</Button>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D5FF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00D5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#00D5FF" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl">
          <CardBody className="p-8">
            <div className="flex flex-col gap-1 mb-10">
              <h3 className="text-xl font-bold text-white tracking-tight">Transactions Volume</h3>
              <p className="text-zinc-500 text-sm">Activity distribution</p>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                    contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}
                  />
                  <Bar dataKey="total" fill="#4267B2" radius={[6, 6, 0, 0]} animationDuration={2500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
