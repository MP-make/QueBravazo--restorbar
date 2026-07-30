import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  dni?: string;
  role: 'client' | 'staff' | 'admin' | 'chef';
}

interface AuthState {
  // Estado
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  firebaseUser: User | null;
  isHydrated: boolean;
  
  // Acciones
  setUser: (user: UserProfile | null) => void;
  setFirebaseUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  
  // Helpers
  isStaff: () => boolean;
  isAdmin: () => boolean;
  isClient: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isLoggedIn: false,
      isLoading: true,
      user: null,
      firebaseUser: null,
      isHydrated: false,
      
      // Setters
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),
      
      // Login
      login: (user) => set({ 
        user, 
        isLoggedIn: true,
        isLoading: false 
      }),
      
      // Logout - limpia estado local y cookie del servidor
      logout: () => {
        fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
        set({ 
          user: null, 
          firebaseUser: null, 
          isLoggedIn: false,
          isLoading: false 
        });
      },
      
      // Helpers para verificar rol
      isStaff: () => {
        const { user } = get();
        return user?.role === 'staff' || user?.role === 'admin';
      },
      
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
      
      isClient: () => {
        const { user } = get();
        return user?.role === 'client';
      },
    }),
    {
      name: 'ventify-auth',
      partialize: (state) => ({ 
        user: state.user,
        isLoggedIn: state.isLoggedIn 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);