import { Card, CardBody, Spinner, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import io from "socket.io-client";
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
import UpcomingSchedules from "../../components/UpcomingSchedules";
import { useTheme } from "../../context/ThemeContext";

const DashboardPage = () => {
  const { data: statsData, isLoading } = useStats();
  const [onlineVisitors, setOnlineVisitors] = useState<number>(0);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor = isDark ? "#ffffff0d" : "#00000008";
  const tickColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipStyle = {
    backgroundColor: isDark ? "rgba(24, 24, 27, 0.95)" : "rgba(255, 255, 255, 0.98)",
    border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
    borderRadius: "16px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  };
  const tooltipItemStyle = { color: isDark ? "#fff" : "#16181d", fontSize: "13px", fontWeight: 600 };

  useEffect(() => {
    // Assuming backend is at VITE_API_URL or defaults to localhost:3001
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Dynamically fallback to production API if we are running in the browser on production domains
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.');
      
      // If the bundled API URL points to localhost but the browser is on a production domain, auto-correct to the production API origin
      if (!isLocal && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
        apiUrl = 'https://api.tiketq.com';
      }
    }

    let socketUrl = 'http://localhost:3001';
    try {
      // Securely extract only the protocol + host origin (stripping sub-paths like /api)
      const urlObj = new URL(apiUrl);
      socketUrl = urlObj.origin;
    } catch (e) {
      socketUrl = apiUrl;
    }

    const socket = io(socketUrl);

    socket.on('visitors_update', (data: { activeVisitors: number }) => {
      setOnlineVisitors(data.activeVisitors);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
    { title: "Online Visitors", value: onlineVisitors.toString(), change: "real-time", trend: "up", icon: Users, color: "text-purple-500" },
    { title: "Total Revenue", value: `Rp ${Number(statsData?.totalRevenue || 0).toLocaleString('id-ID')}`, change: statsData?.growth || "—", trend: "up", icon: CreditCard, color: "text-blue-500" },
    { title: "Successful Txns", value: statsData?.successfulTransactions?.toString() || '0', change: successRate, trend: "up", icon: Users, color: "text-[#00D5FF]" },
    { title: "Total Bookings", value: statsData?.totalTransactions?.toString() || '0', change: "all time", trend: "up", icon: TrendingUp, color: "text-green-500" },
    { title: "Available Cars", value: statsData?.activeCars?.toString() || '0', change: "in fleet", trend: "up", icon: Car, color: "text-orange-500" },
  ];

  const chartData = statsData?.chartData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* System Health Section */}
      <SystemHealth />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-surface border-border shadow-2xl hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-surface blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-surface border border-border shadow-inner ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend === "up" ? "bg-green-500/10 text-green-400 border border-green-500/10" : "bg-red-500/10 text-red-400 border border-red-500/10"}`}>
                  {stat.change}
                  {stat.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-surface border-border shadow-2xl overflow-hidden">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-foreground tracking-tight">Revenue Performance</h3>
                <p className="text-muted text-sm">Monthly growth and volume trends</p>
              </div>
              <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border">
                <Button size="sm" variant="light" className="text-foreground text-xs font-bold">Monthly</Button>
                <Button size="sm" variant="flat" className="text-muted text-xs font-bold">Annually</Button>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={tooltipItemStyle}
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

        <Card className="bg-surface border-border shadow-2xl">
          <CardBody className="p-8">
            <div className="flex flex-col gap-1 mb-10">
              <h3 className="text-xl font-bold text-foreground tracking-tight">Transactions Volume</h3>
              <p className="text-muted text-sm">Activity distribution</p>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="total" fill="#4267B2" radius={[6, 6, 0, 0]} animationDuration={2500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Upcoming Schedules Pipeline Section */}
      <UpcomingSchedules />
    </div>
  );
};

export default DashboardPage;
