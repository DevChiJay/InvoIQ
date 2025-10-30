import { useQuery } from '@tanstack/react-query';
import { clientsAPI, invoicesAPI } from '@/lib/api';
import type { Invoice } from '@/types/api';

export interface DashboardStats {
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  overdueInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch clients and invoices in parallel
      const [clientsResponse, invoicesResponse] = await Promise.all([
        clientsAPI.getAll(),
        invoicesAPI.getAll(),
      ]);

      const clients = clientsResponse.data;
      const invoices = invoicesResponse.data;

      // Calculate stats
      const totalRevenue = invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

      const paidInvoices = invoices.filter((inv) => inv.status === 'paid').length;
      const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue').length;
      const unpaidInvoices = invoices.filter(
        (inv) => inv.status === 'sent' || inv.status === 'draft'
      ).length;

      return {
        totalClients: clients.length,
        totalInvoices: invoices.length,
        totalRevenue,
        overdueInvoices,
        paidInvoices,
        unpaidInvoices,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRecentInvoices = (limit = 5) => {
  return useQuery({
    queryKey: ['recent-invoices', limit],
    queryFn: async (): Promise<Invoice[]> => {
      const response = await invoicesAPI.getAll({ limit, offset: 0 });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
