import axios from 'axios';
import type {
  User,
  Client,
  ClientCreate,
  ClientUpdate,
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  InvoiceListParams,
  BackendExtractionResponse,
  SubscriptionStatus,
  AuthResponse,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email: string, password: string) => {
    // Backend uses OAuth2PasswordRequestForm which expects form data with 'username' and 'password'
    const formData = new URLSearchParams();
    formData.append('username', email);  // OAuth2 uses 'username' field
    formData.append('password', password);
    
    return api.post<AuthResponse>('/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  register: (email: string, password: string, full_name: string) =>
    api.post<User>('/v1/auth/register', { email, password, full_name }),
  
  getCurrentUser: () =>
    api.get<User>('/v1/me'),
};

export const clientsAPI = {
  getAll: (limit?: number, offset?: number) =>
    api.get<Client[]>('/v1/clients', { params: { limit, offset } }),
  
  getById: (id: number) =>
    api.get<Client>(`/v1/clients/${id}`),
  
  create: (data: ClientCreate) =>
    api.post<Client>('/v1/clients', data),
  
  update: (id: number, data: ClientUpdate) =>
    api.put<Client>(`/v1/clients/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/v1/clients/${id}`),
};

export const invoicesAPI = {
  getAll: (params?: InvoiceListParams) =>
    api.get<Invoice[]>('/v1/invoices', { params }),
  
  getById: (id: number) =>
    api.get<Invoice>(`/v1/invoices/${id}`),
  
  create: (data: InvoiceCreate) =>
    api.post<Invoice>('/v1/invoices', data),
  
  update: (id: number, data: InvoiceUpdate) =>
    api.put<Invoice>(`/v1/invoices/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/v1/invoices/${id}`),
};

export const generateAPI = {
  generateInvoice: (data: {
    client_id: number;
    extraction_id?: number;
    items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      amount?: number;
    }>;
    issued_date?: string;
    due_date?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    number?: string;
    payment_provider?: 'paystack' | 'stripe';
    payment_link?: string;
    currency?: string;
  }) =>
    api.post<Invoice>('/v1/generate-invoice', data),
};

export const extractionAPI = {
  extractJobDetails: (formData: FormData) =>
    api.post<BackendExtractionResponse>('/v1/extract-job-details', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const paymentsAPI = {
  createSubscription: (data: { provider: 'paystack' | 'stripe'; currency: string; callback_url?: string }) =>
    api.post<{ payment_url: string; reference: string }>('/v1/payments/subscription/create', data),
  
  verifyPayment: (data: { reference: string; provider: 'paystack' | 'stripe' }) =>
    api.post<{ message: string; is_pro: boolean }>('/v1/payments/subscription/verify', data),
  
  getSubscriptionStatus: () =>
    api.get<SubscriptionStatus>('/v1/payments/subscription/status'),
  
  sendReminder: (invoice_id: number) =>
    api.post<{ status: string; invoice_id: number }>('/v1/send-reminder', null, { params: { invoice_id } }),
};

// Demo extraction helper - uses the same endpoint as authenticated extraction
export const demoExtract = async (text: string) => {
  const formData = new FormData();
  formData.append('text', text);
  // file field is not added, will be null on backend
  return extractionAPI.extractJobDetails(formData);
};
