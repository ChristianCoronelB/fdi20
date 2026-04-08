import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, UserRole } from '@/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface EventState {
  currentEventId: string | null;
  setCurrentEvent: (eventId: string | null) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      currentEventId: null,
      setCurrentEvent: (eventId) => set({ currentEventId: eventId }),
    }),
    {
      name: 'event-storage',
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  currentView: 'admin' | 'user';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: 'admin' | 'user') => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  currentView: 'admin',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentView: (view) => set({ currentView: view }),
}));

interface NotificationState {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
  }>;
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  clearAll: () => set({ notifications: [] }),
}));

// Check if user has required role
export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 4,
    ORGANIZER: 3,
    MODERATOR: 2,
    PARTICIPANT: 1,
  };
  
  return requiredRoles.some((role) => roleHierarchy[userRole] >= roleHierarchy[role]);
}
