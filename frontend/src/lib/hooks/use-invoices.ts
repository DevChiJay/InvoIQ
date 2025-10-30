import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI } from '@/lib/api';
import type { InvoiceCreate, InvoiceUpdate, InvoiceListParams } from '@/types/api';
import { toast } from 'sonner';

export const useInvoices = (params?: InvoiceListParams) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await invoicesAPI.getAll(params);
      return response.data;
    },
  });
};

export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const response = await invoicesAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvoiceCreate) => invoicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to create invoice');
    },
  });
};

export const useUpdateInvoice = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvoiceUpdate) => invoicesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to update invoice');
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invoicesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete invoice');
    },
  });
};
