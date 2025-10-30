import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsAPI } from '@/lib/api';
import type { ClientCreate, ClientUpdate } from '@/types/api';
import { toast } from 'sonner';

export const useClients = (limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ['clients', { limit, offset }],
    queryFn: async () => {
      const response = await clientsAPI.getAll(limit, offset);
      return response.data;
    },
  });
};

export const useClient = (id: number) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const response = await clientsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientCreate) => clientsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Client created successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to create client');
    },
  });
};

export const useUpdateClient = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientUpdate) => clientsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', id] });
      toast.success('Client updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update client');
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Client deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete client');
    },
  });
};
