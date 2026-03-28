import { Card, CardBody, Spinner } from "@nextui-org/react";
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
import { useStats } from "../../hooks/useAdmin.ts";

const data = [
  { name: "Jan", total: 4000, revenue: 2400 },
  { name: "Feb", total: 3000, revenue: 1398 },
  { name: "Mar", total: 2000, revenue: 9800 },
  { name: "Apr", total: 2780, revenue: 3908 },
  { name: "May", total: 1890, revenue: 4800 },
  { name: "Jun", total: 2390, revenue: 3800 },
  { name: "Jul", total: 3490, revenue: 4300 },
];

const DashboardPage = () => {
  const { data: statsData, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const stats = [
    { title: "Total Revenue", value: `$${statsData?.totalRevenue?.toLocaleString() || '0'}`, change: statsData?.growth || "+0%", trend: "up", icon: CreditCard, color: "text-blue-500" },
    { title: "Successful txns", value: statsData?.successfulTransactions?.toString() || '0', change: "+18.1%", trend: "up", icon: Users, color: "text-[#00D5FF]" },
    { title: "Total Bookings", value: statsData?.totalTransactions?.toString() || '0', change: "+19%", trend: "up", icon: TrendingUp, color: "text-green-500" },
    { title: "Available Cars", value: statsData?.activeCars?.toString() || '0', change: "-0%", trend: "down", icon: Car, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <p className="text-zinc-500">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-zinc-900/50 border-white/5 backdrop-blur-md shadow-xl hover:translate-y-[-4px] transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-zinc-800/50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                  {stat.change}
                  {stat.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                </div>
              </div>
              <div>
                <p className="text-zinc-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-zinc-900/50 border-white/5 backdrop-blur-md overflow-hidden">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Revenue Performance</h3>
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#4267B2]" />
                  <span className="text-zinc-400">Target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#00D5FF]" />
                  <span className="text-zinc-400">Actual</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4267B2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4267B2" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D5FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4267B2" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#00D5FF" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-md">
          <CardBody className="p-8">
            <h3 className="text-xl font-bold text-white mb-8">Transactions Volume</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Bar dataKey="total" fill="#4267B2" radius={[4, 4, 0, 0]} />
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
