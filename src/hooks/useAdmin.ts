import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/api.ts";

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
}

export interface Car {
  id: number;
  name: string;
  type: string;
  rows: number;
  pricePerDay: number;
  available: boolean;
  photos?: { url: string }[];
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

  return { createCar, updateCar, deleteCar };
};
