import axios from "axios";
import { toast } from "sonner";
import type { Car, Transaction, Stats, Health } from "../hooks/useAdmin";
import type { User as AuthUser } from "../services/AuthService";

interface AppResponse<T> {
  message: string;
  data: T;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Auth Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || "Something went wrong";
    
    // Don't show toast for 401 on /auth/me (check initial auth)
    const isCheckAuth = error.config.url === "/auth/me";
    
    if (error.response?.status >= 500) {
      toast.error("Server Error", {
        description: "The server encountered an internal error. Please try again later.",
      });
    } else if (error.response?.status !== 401 || !isCheckAuth) {
      // Show error toast for other errors except initial auth check
      toast.error("Error", {
        description: message,
      });
    }

    return Promise.reject(error);
  }
);

export const adminService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const { data } = await api.get<AppResponse<Transaction[]>>("/admin/transactions");
    return data.data;
  },
  getStats: async (): Promise<Stats> => {
    const { data } = await api.get<AppResponse<Stats>>("/admin/stats");
    return data.data;
  },
  getHealth: async (): Promise<Health> => {
    const { data } = await api.get<AppResponse<Health>>("/admin/health");
    return data.data;
  },
  
  // User Management
  getUsers: async (): Promise<AuthUser[]> => {
    const { data } = await api.get<AppResponse<AuthUser[]>>("/admin/users");
    return data.data;
  },
  registerUser: async (userData: Record<string, unknown>) => {
    const { data } = await api.post<AppResponse<AuthUser>>("/admin/users/register", userData);
    return data.data;
  },
  updateUser: async (id: number, userData: Record<string, unknown>) => {
    const { data } = await api.put<AppResponse<AuthUser>>(`/admin/users/${id}`, userData);
    return data.data;
  },
  deleteUser: async (id: number) => {
    const { data } = await api.delete<AppResponse<void>>(`/admin/users/${id}`);
    return data.data;
  },

  getCars: async () => {
    const { data } = await api.get("/car-rental/cars");
    return data.data;
  },
  createCar: async (carData: Partial<Car>) => {
    const { data } = await api.post("/car-rental/cars", carData);
    return data.data;
  },
  updateCar: async (id: number, carData: Partial<Car>) => {
    const { data } = await api.put(`/car-rental/cars/${id}`, carData);
    return data.data;
  },
  deleteCar: async (id: number) => {
    const { data } = await api.delete(`/car-rental/cars/${id}`);
    return data.data;
  },

  uploadPhotos: async (carId: number, photos: File[]) => {
    const formData = new FormData();
    photos.forEach((photo) => formData.append("photos", photo));
    const { data } = await api.post(`/car-rental/cars/${carId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  deletePhoto: async (photoId: number) => {
    const { data } = await api.delete(`/car-rental/photos/${photoId}`);
    return data.data;
  },
  deletePhotosBulk: async (photoIds: number[]) => {
    const { data } = await api.post("/car-rental/photos/bulk-delete", { ids: photoIds });
    return data.data;
  },
};
