import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../utils/auth';
import { User } from '../../types';

// Query keys
export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
};

// Fetch current user
export const useCurrentUser = (enabled: boolean = true) => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async () => {
      return await authService.getCurrentUser();
    },
    enabled: enabled && authService.isAuthenticated(),
    staleTime: 1000 * 60 * 10, // User data is fresh for 10 minutes
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      return await authService.updateUser(userData);
    },
    onSuccess: (data) => {
      // Update the current user in cache
      queryClient.setQueryData(userKeys.current(), data);
    },
  });
};

// Rate user mutation
export const useRateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, rating }: { userId: number; rating: number }) => {
      await authService.rateUser(userId, rating);
    },
    onSuccess: () => {
      // Invalidate user data to refetch with updated ratings
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

