import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/api";

export interface Transaction {
  id: number;
  serviceType: string;
  email: string;
  totalSales: number;
  status: string;
  createdAt: string;
  flightBooking?: { name?: string };
  ferryBooking?: { mobile_number?: string };
  carRentalRequest?: { fullName?: string };
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
  available: boolean;
  description?: string;
  transmission?: string;
  features?: string[];
  photos?: { id: number; url: string; isPrimary: boolean }[];
}

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: adminService.getTransactions,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: adminService.getStats,
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
