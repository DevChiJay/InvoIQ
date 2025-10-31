import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsAPI } from '@/lib/api';

export interface SubscriptionStatus {
  is_pro: boolean;
  subscription_status: string | null;
  subscription_provider: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  days_remaining: number | null;
}

export interface CreateSubscriptionRequest {
  provider: 'paystack' | 'stripe';
  currency: string;
  callback_url?: string;
}

export interface SubscriptionResponse {
  payment_url: string;
  reference: string;
}

export interface VerifyPaymentRequest {
  reference: string;
  provider: 'paystack' | 'stripe';
}

// Get subscription status
export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      const response = await paymentsAPI.getSubscriptionStatus();
      return response.data;
    },
  });
}

// Create subscription payment link
export function useCreateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation<SubscriptionResponse, Error, CreateSubscriptionRequest>({
    mutationFn: async (data) => {
      const response = await paymentsAPI.createSubscription(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

// Verify subscription payment
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string; is_pro: boolean }, Error, VerifyPaymentRequest>({
    mutationFn: async (data) => {
      const response = await paymentsAPI.verifyPayment(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

// Send invoice reminder
export function useSendReminder() {
  return useMutation<{ status: string; invoice_id: number }, Error, number>({
    mutationFn: async (invoiceId) => {
      const response = await paymentsAPI.sendReminder(invoiceId);
      return response.data;
    },
  });
}
