import axios from "axios";
import type { Car, Transaction, Stats } from "../hooks/useAdmin.ts";

interface AppResponse<T> {
  message: string;
  data: T;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;

export const adminService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const { data } = await api.get<AppResponse<Transaction[]>>("/admin/transactions");
    return data.data;
  },
  getStats: async (): Promise<Stats> => {
    const { data } = await api.get<AppResponse<Stats>>("/admin/stats");
    return data.data;
  },
  getCars: async () => {
    const { data } = await api.get("/car-rental/cars");
    return data.data;
  },
  createCar: async (carData: Partial<Car>): Promise<Car> => {
    const { data } = await api.post<AppResponse<Car>>("/car-rental/cars", carData);
    return data.data;
  },
  updateCar: async (id: number, carData: Partial<Car>): Promise<Car> => {
    const { data } = await api.put<AppResponse<Car>>(`/car-rental/cars/${id}`, carData);
    return data.data;
  },
  deleteCar: async (id: number) => {
    const { data } = await api.delete(`/car-rental/cars/${id}`);
    return data.data;
  }
};
