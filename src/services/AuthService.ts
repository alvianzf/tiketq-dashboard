import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  message: string;
}

const AuthService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/admin-login`, {
      username,
      password,
    });
    const { token } = response.data;
    if (token) {
      localStorage.setItem("token", token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getCurrentToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getMe: async (): Promise<User> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  },
};

export default AuthService;
