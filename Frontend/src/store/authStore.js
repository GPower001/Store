import { create } from "zustand";
import { login } from "../services/authService";
import api from "../services/api";


const storedToken = localStorage.getItem("inventory_token");
const storedUser = localStorage.getItem("inventory_user");

const useAuthStore = create((set) => ({
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const data = await login({
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", data);

      if (data.twoFactorRequired) {
        set({ loading: false, error: null });
        return data;
      }

      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return data;
    } catch (error) {
      set({
        loading: false,
        error: error.message,
        isAuthenticated: false,
      });

      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("inventory_token");
      localStorage.removeItem("inventory_user");

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  updateUser: (user) => {
    localStorage.setItem("inventory_user", JSON.stringify(user));
    set({ user });
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));

export default useAuthStore;