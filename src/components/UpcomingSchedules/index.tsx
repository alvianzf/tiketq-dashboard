import { Card, CardBody, Spinner, Chip } from "@nextui-org/react";
import { useSchedules, type Schedule } from "../../hooks/useAdmin";
import { Plane, Ship, Car, Calendar, User } from "lucide-react";

import React from "react";

interface ScheduleListProps {
  title: string;
  icon: React.ElementType;
  items: Schedule[];
  emptyText: string;
  colorClass: string;
  borderClass: string;
}

const ScheduleList = ({ title, icon: Icon, items, emptyText, colorClass, borderClass }: ScheduleListProps) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl h-[400px]">
    <CardBody className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl border ${borderClass} shadow-inner`}>
          <Icon size={20} className={colorClass} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-zinc-500 font-medium">Next 7 Days</p>
        </div>
        <Chip size="sm" className="ml-auto bg-white/10 text-white font-bold border-none" variant="flat">
          {items.length}
        </Chip>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <Calendar size={32} className="text-zinc-500 mb-3" />
            <p className="text-sm font-medium text-zinc-400 text-center">{emptyText}</p>
          </div>
        ) : (
          items.map((item: Schedule) => {
            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return (
              <div key={item.id} className="group flex flex-col gap-2 p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono tracking-widest text-zinc-500">{item.id.split('-')[1]}</span>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${borderClass} opacity-80 uppercase tracking-widest`}>
                    {dateStr}
                  </div>
                </div>
                
                <h4 className="text-white font-bold text-sm leading-tight group-hover:text-blue-400 transition-colors">
                  {item.detail}
                </h4>
                
                <div className="flex items-center gap-1.5 mt-1 text-zinc-400">
                  <User size={12} className="opacity-70" />
                  <span className="text-xs font-medium truncate">{item.customerName}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </CardBody>
  </Card>
);

const UpcomingSchedules = () => {
  const { data: schedules, isLoading } = useSchedules();

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl h-[300px]">
        <CardBody className="flex items-center justify-center">
          <Spinner size="lg" color="primary" />
        </CardBody>
      </Card>
    );
  }

  const upcomingFlights = schedules?.filter((s) => s.type === "FLIGHT") || [];
  const upcomingFerries = schedules?.filter((s) => s.type === "FERRY") || [];
  const upcomingCars = schedules?.filter((s) => s.type === "CAR") || [];


  return (
    <div className="mt-8">
      <div className="flex flex-col gap-1 mb-6">
        <h3 className="text-xl font-bold text-white tracking-tight">Upcoming Schedules</h3>
        <p className="text-zinc-500 text-sm">Confirmed bookings over the next 7 days</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScheduleList 
          title="Flights" 
          icon={Plane} 
          items={upcomingFlights} 
          emptyText="No upcoming flight departures."
          colorClass="text-[#4267B2]"
          borderClass="bg-[#4267B2]/10 border-[#4267B2]/20 text-[#4267B2]"
        />
        <ScheduleList 
          title="Ferries" 
          icon={Ship} 
          items={upcomingFerries} 
          emptyText="No upcoming ferry departures."
          colorClass="text-[#00D5FF]"
          borderClass="bg-[#00D5FF]/10 border-[#00D5FF]/20 text-[#00D5FF]"
        />
        <ScheduleList 
          title="Car Rentals" 
          icon={Car} 
          items={upcomingCars} 
          emptyText="No upcoming car rentals."
          colorClass="text-emerald-400"
          borderClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        />
      </div>
    </div>
  );
};

export default UpcomingSchedules;
