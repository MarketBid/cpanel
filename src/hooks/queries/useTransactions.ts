import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { Transaction, TransactionStatus } from '../../types';

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: { status?: TransactionStatus; search?: string }) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  byPaymentCode: (code: string) => [...transactionKeys.all, 'payment-code', code] as const,
};

// Fetch all transactions
export const useTransactions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: transactionKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<Transaction[]>('/transactions');
      return response.data;
    },
    enabled: options?.enabled,
  });
};

// Fetch single transaction by ID
export const useTransaction = (transactionId: string | undefined, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  // Ensure transactionId is a string and not undefined or an object
  const validTransactionId = typeof transactionId === 'string' ? transactionId : undefined;

  return useQuery({
    queryKey: transactionKeys.detail(validTransactionId!),
    queryFn: async () => {
      if (!validTransactionId) throw new Error('Transaction ID is required');
      const response = await apiClient.get<Transaction>(`/transactions/${validTransactionId}`);
      return response.data;
    },
    enabled: !!validTransactionId && enabled,
    initialData: () => {
      if (!validTransactionId) return undefined;
      const transactions = queryClient.getQueryData<Transaction[]>(transactionKeys.lists());
      return transactions?.find((t) => t.transaction_id === validTransactionId);
    },
    initialDataUpdatedAt: () => {
      return queryClient.getQueryState(transactionKeys.lists())?.dataUpdatedAt;
    },
  });
};

// Fetch transaction by payment code
export const useTransactionByPaymentCode = (paymentCode: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: transactionKeys.byPaymentCode(paymentCode!),
    queryFn: async () => {
      if (!paymentCode) throw new Error('Payment code is required');
      const response = await apiClient.get<Transaction>(`/transactions/payment-code/${paymentCode}`);
      return response.data;
    },
    enabled: !!paymentCode && enabled,
    retry: false,
  });
};

// Update transaction status mutation
export const useUpdateTransactionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string | number; status: TransactionStatus }) => {
      const response = await apiClient.patch<Transaction>(`/transactions/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (updatedTransaction) => {
      // Update the specific transaction in cache with the fresh response
      if (updatedTransaction?.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(updatedTransaction.transaction_id), updatedTransaction);
      }

      // Also update in the transactions list cache
      queryClient.setQueryData(transactionKeys.lists(), (old: Transaction[] | undefined) => {
        if (!old) return [updatedTransaction];
        return old.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t));
      });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      if (updatedTransaction?.transaction_id) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.detail(updatedTransaction.transaction_id) });
      }
    },
  });
};

// Cancel transaction mutation
export const useCancelTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.put<Transaction>(`/transactions/cancel/${id}`);
      return response.data;
    },
    onSuccess: (cancelledTransaction) => {
      if (cancelledTransaction?.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(cancelledTransaction.transaction_id), cancelledTransaction);
      }
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

// Restore transaction mutation
export const useRestoreTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.put<Transaction>(`/transactions/restore/${id}`);
      return response.data;
    },
    onSuccess: (restoredTransaction) => {
      if (restoredTransaction?.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(restoredTransaction.transaction_id), restoredTransaction);
      }
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

// Mark transaction as in transit mutation
export const useMarkTransactionInTransit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.put<Transaction>(`/transactions/in-transit/${id}`);
      return response.data;
    },
    onSuccess: (updatedTransaction) => {
      if (updatedTransaction?.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(updatedTransaction.transaction_id), updatedTransaction);
      }
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

// Mark transaction as delivered mutation
export const useMarkTransactionDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.put<Transaction>(`/transactions/deliver/${id}`);
      return response.data;
    },
    onSuccess: (updatedTransaction) => {
      if (updatedTransaction?.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(updatedTransaction.transaction_id), updatedTransaction);
      }
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

// Mark transaction as received mutation
export const useMarkTransactionReceived = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.put<Transaction>(`/transactions/receive/${id}`);
      return response.data;
    },
    onSuccess: (updatedTransaction) => {
      if (updatedTransaction?.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(updatedTransaction.transaction_id), updatedTransaction);
      }
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

// Mark milestone as complete mutation
export const useMarkMilestoneComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, milestoneId }: { transactionId: string | number; milestoneId: string }) => {
      const response = await apiClient.put<Transaction>(`/transactions/${transactionId}/milestones/${milestoneId}/complete`);
      return response.data;
    },
    onSuccess: (updatedTransaction) => {
      if (updatedTransaction?.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(updatedTransaction.transaction_id), updatedTransaction);
      }
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

// Create transaction mutation
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: any) => {
      const response = await apiClient.post<any>('/transactions/create', transactionData);

      // API returns a wrapped payload (e.g. { data: Transaction }).
      // We need to unwrap it safely to get the actual Transaction object.
      const unwrap = (o: any) => {
        if (!o) return o;
        if (typeof o === 'object' && 'transaction_id' in o) return o;
        if (typeof o === 'object' && 'data' in o) {
          // Check if 'data' property holds the transaction object
          // This handles cases where response.data is { data: Transaction }
          // or where response is { data: Transaction } (axios structure)
          // But here 'response.data' is already the body.
          // So if body has .data, we might need that.
          // Let's be safe and check if the inner object looks like a transaction
          if (typeof o.data === 'object' && 'transaction_id' in o.data) return o.data;
          // If o.data is the transaction array or something else, be careful.
          // For create, it should be a single object.
          return o.data;
        }
        return o;
      };

      return unwrap(response.data);
    },
    onSuccess: (newTransaction) => {
      // Invalidate transactions list to refetch with new transaction
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Populate the transaction detail cache immediately if we have an id so
      // components navigating to the new transaction can read from cache.
      if (newTransaction && newTransaction.transaction_id) {
        queryClient.setQueryData(transactionKeys.detail(newTransaction.transaction_id), newTransaction);
      }
    },
  });
};

// Join transaction mutation
export const useJoinTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: { transactionId: string; paymentCode?: string }) => {
      const response = await apiClient.post<Transaction>(`/transactions/${variables.transactionId}/join`, {
        payment_code: variables.paymentCode
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.transactionId) });
      if (variables.paymentCode) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.byPaymentCode(variables.paymentCode) });
      }
    },
  });
};


