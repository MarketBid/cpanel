import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { Account, AccountType } from '../../types';

// Query keys
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
};

// Fetch all accounts
export const useAccounts = () => {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<Account[]>('/payment/accounts/');
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // Accounts are fresh for 10 minutes
  });
};

// Add account mutation
export const useAddAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData: {
      name: string;
      number: string;
      type: AccountType;
      service_provider: string;
    }) => {
      const response = await apiClient.post<Account>('/payment/accounts/', accountData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate accounts list to refetch
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
};

// Update account mutation
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, accountData }: { 
      accountId: number; 
      accountData: Partial<Account> 
    }) => {
      const response = await apiClient.put<Account>(`/payment/accounts/${accountId}`, accountData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
};

// Delete account mutation
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: number) => {
      await apiClient.delete(`/payment/accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
};

