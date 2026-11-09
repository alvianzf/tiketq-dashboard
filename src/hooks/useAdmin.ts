import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/api";

export interface Transaction {
  id: number;
  serviceType: string;
  bookingCode?: string;
  email: string;
  totalSales: number;
  status: string;
  createdAt: string;
  flightBooking?: {
    id: number;
    name?: string;
    origin?: string;
    destination?: string;
    departureDate?: string;
    passengers?: any[];
    ticketIssued?: boolean;
  };
  ferryBooking?: {
    id: number;
    mobile_number?: string;
    origin?: { name: string };
    destination?: { name: string };
    departureDate?: string;
    passengers?: any[];
    ticketIssued?: boolean;
  };
  carRentalRequest?: { 
    id: number;
    fullName?: string; 
    date?: string;
    rentalDays?: number;
    car?: { name: string; type: string };
  };
}

export interface Stats {
  totalTransactions: number;
  successfulTransactions: number;
  totalRevenue: number;
  activeCars: number;
  growth: string;
  chartData: { name: string; total: number }[];
  serviceDistribution: { name: string; value: number; color: string }[];
}

export interface Health {
  status: string;
  services: { name: string; status: string; latency: string }[];
  system: { cpu: string; memory: string; uptime: string; cpuPercent?: number; memPercent?: number };
}

export interface Car {
  id: number;
  name: string;
  type: string;
  rows: number;
  pricePerDay: number;
  pricingDuration?: string;
  available: boolean;
  description?: string;
  transmission?: string;
  features?: string[];
  photos?: { id: number; url: string; isPrimary: boolean }[];
}

export interface Destination {
  id: number;
  name: string;
  area: string;
  category?: string;
  description?: string;
  tags: string[];
  minStayMinutes: number;
  travelGapMinutes: number;
  price: number;
  photos: string[];
  available: boolean;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  description?: string;
  pricePerNight: number;
  amenities: string[];
  photos: string[];
  available: boolean;
}

export interface Activity {
  id: number;
  name: string;
  category: string;
  location?: string;
  description?: string;
  price: number;
  duration?: string;
  photos: string[];
  available: boolean;
}

export interface Schedule {
  id: string;
  type: "FLIGHT" | "FERRY" | "CAR";
  productName: string;
  date: string;
  customerName: string;
  detail: string;
}

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: adminService.getTransactions,
  });
};

export const useTransactionMutation = () => {
  const queryClient = useQueryClient();

  const cancelTransaction = useMutation({
    mutationFn: (id: number) => adminService.cancelTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const refundTransaction = useMutation({
    mutationFn: (id: number) => adminService.refundTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  return { cancelTransaction, refundTransaction };
};

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: adminService.getStats,
  });
};

export const useSchedules = () => {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: adminService.getUpcomingSchedules,
  });
};

export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: adminService.getHealth,
    refetchInterval: 5000, // Refresh every 5s for health monitoring
  });
};

export const useCars = () => {
  return useQuery({
    queryKey: ["cars"],
    queryFn: adminService.getCars,
  });
};

export const useCarMutation = () => {
  const queryClient = useQueryClient();

  const createCar = useMutation({
    mutationFn: adminService.createCar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });

  const updateCar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Car> }) => adminService.updateCar(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });

  const deleteCar = useMutation({
    mutationFn: (id: number) => adminService.deleteCar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });

  const uploadPhotos = useMutation({
    mutationFn: ({ carId, photos }: { carId: number; photos: File[] }) => adminService.uploadPhotos(carId, photos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });

  const deletePhoto = useMutation({
    mutationFn: (photoId: number) => adminService.deletePhoto(photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });

  const deletePhotosBulk = useMutation({
    mutationFn: (photoIds: number[]) => adminService.deletePhotosBulk(photoIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });

  return { createCar, updateCar, deleteCar, uploadPhotos, deletePhoto, deletePhotosBulk };
};

export const useDestinations = () => {
  return useQuery({ queryKey: ["destinations"], queryFn: adminService.getDestinations });
};

export const useDestinationMutation = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["destinations"] });

  const createDestination = useMutation({ mutationFn: adminService.createDestination, onSuccess: invalidate });
  const updateDestination = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Destination> }) => adminService.updateDestination(id, data),
    onSuccess: invalidate,
  });
  const deleteDestination = useMutation({ mutationFn: adminService.deleteDestination, onSuccess: invalidate });

  return { createDestination, updateDestination, deleteDestination };
};

export const useHotels = () => {
  return useQuery({ queryKey: ["hotels"], queryFn: adminService.getHotels });
};

export const useHotelMutation = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["hotels"] });

  const createHotel = useMutation({ mutationFn: adminService.createHotel, onSuccess: invalidate });
  const updateHotel = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Hotel> }) => adminService.updateHotel(id, data),
    onSuccess: invalidate,
  });
  const deleteHotel = useMutation({ mutationFn: adminService.deleteHotel, onSuccess: invalidate });

  return { createHotel, updateHotel, deleteHotel };
};

export const useActivities = () => {
  return useQuery({ queryKey: ["activities"], queryFn: adminService.getActivities });
};

export const useActivityMutation = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["activities"] });

  const createActivity = useMutation({ mutationFn: adminService.createActivity, onSuccess: invalidate });
  const updateActivity = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Activity> }) => adminService.updateActivity(id, data),
    onSuccess: invalidate,
  });
  const deleteActivity = useMutation({ mutationFn: adminService.deleteActivity, onSuccess: invalidate });

  return { createActivity, updateActivity, deleteActivity };
};
