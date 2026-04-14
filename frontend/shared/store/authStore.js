import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('user');
      return (stored && stored !== 'undefined' && stored !== 'null') ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login'; // Force redirect
  },

  updateProfile: (profileData) => {
    set((state) => {
      const newUser = { ...state.user, profile: { ...state.user.profile, ...profileData } };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  }
}));

export default useAuthStore;
