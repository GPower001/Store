// import {create} from 'zustand';

// export const useAuthStore = create((set) => ({
//   user: null,
//   isLoggedIn: false,
//   setUser: (user) => set({ user, isLoggedIn: !!user }),
//   logout: () => set({ user: null, isLoggedIn: false }),

//   updateLoginStatus: (status) => set({ isLoggedIn: status }),
// }));


import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  branchId: localStorage.getItem("branchId") || null,
  isLoggedIn: !!localStorage.getItem("token"),

  // Save user + token + branchId after login
  setAuth: ({ user, token }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("branchId", user.branchId);
    localStorage.setItem("user", JSON.stringify(user));

    set({
      user,
      token,
      branchId: user.branchId,
      isLoggedIn: true,
    });
  },

  // Restore session on page reload
  loadAuth: () => {
    const token = localStorage.getItem("token");
    const branchId = localStorage.getItem("branchId");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && branchId && user) {
      set({
        token,
        branchId,
        user,
        isLoggedIn: true,
      });
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("branchId");
    localStorage.removeItem("user");

    set({ user: null, token: null, branchId: null, isLoggedIn: false });
  },
}));
