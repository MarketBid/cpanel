import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { authService } from '../utils/auth';
import { useCurrentUser, userKeys } from './queries/useUser';
import { WebSocketManager } from './useTransactionEvents';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  // Make auth flag stateful so we can re-enable/refetch user after login/logout
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());

  // Use React Query to fetch and cache user data. Enabled only when isAuthenticated is true.
  const { data: user = null, isLoading: loading } = useCurrentUser(isAuthenticated);

  const login = useCallback(
    async (email: string, password: string) => {
      await authService.login({ username: email, password });
      // Mark authenticated so the useCurrentUser query becomes enabled
      setIsAuthenticated(true);

      // Force fetch current user and populate cache immediately so UI updates right away
      try {
        const freshUser = await queryClient.fetchQuery({
          queryKey: userKeys.current(),
          queryFn: () => authService.getCurrentUser(),
        });
        queryClient.setQueryData(userKeys.current(), freshUser);
      } catch (err) {
        // If fetching user fails, invalidate so other parts react and let them handle errors
        await queryClient.invalidateQueries({ queryKey: userKeys.current() });
      }

      // Connect WebSocket after successful login
      WebSocketManager.connect();
    },
    [queryClient]
  );

  const register = async (userData: any) => {
    await authService.register(userData);
    // Invalidate and refetch user data
    await queryClient.invalidateQueries({ queryKey: userKeys.current() });
  };

  const logout = useCallback(async () => {
    // Disconnect WebSocket before logout
    WebSocketManager.disconnect();

    authService.logout();
    // Mark unauthenticated so useCurrentUser will be disabled
    setIsAuthenticated(false);

    // Remove cached current user immediately so UI updates to logged-out state
    queryClient.setQueryData(userKeys.current(), null);
    // Clear other user-related cached queries
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  }, [queryClient]);

  const updateUser = async (userData: Partial<User>) => {
    // This will be handled by the useUpdateUser mutation hook
    // But we keep this for backward compatibility
    const updatedUser = await authService.updateUser(userData);
    queryClient.setQueryData(userKeys.current(), updatedUser);
  };

  // Auto-connect on mount if already authenticated
  useEffect(() => {
    if (isAuthenticated && !WebSocketManager.isConnected() && !WebSocketManager.isConnecting()) {
      WebSocketManager.connect();
    }

    return () => {
      // Optional: disconnect on unmount if needed
      // WebSocketManager.disconnect();
    };
  }, [isAuthenticated]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};