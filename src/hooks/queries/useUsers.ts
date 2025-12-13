import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { User } from '../../types';

// Query keys
export const userListKeys = {
  all: ['users'] as const,
  lists: () => [...userListKeys.all, 'list'] as const,
};

// Fetch all users
export const useUsers = () => {
  return useQuery({
    queryKey: userListKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<User[]>('/auth/users');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Users list is fresh for 5 minutes
  });
};

