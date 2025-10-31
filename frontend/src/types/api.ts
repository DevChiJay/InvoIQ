// User Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_pro: boolean;
  subscription_status?: string;
  subscription_expires_at?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;  // OAuth2 uses 'username' field (but we send email)
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// Client Types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ClientCreate {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ClientUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Invoice Types
export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: number;
  number: string;
  client_id: number;
  client?: Client;
  issued_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  payment_link?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceCreate {
  client_id: number;
  issued_date: string;
  due_date: string;
  items: InvoiceItem[];
  tax?: number;
  notes?: string;
}

export interface InvoiceUpdate {
  client_id?: number;
  issued_date?: string;
  due_date?: string;
  items?: InvoiceItem[];
  tax?: number;
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

export interface InvoiceListParams {
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
  client_id?: number;
  limit?: number;
  offset?: number;
  due_from?: string;
  due_to?: string;
  cursor?: number;
}

// Extraction Types - Backend Response Format
export interface BackendExtractionData {
  jobs?: string[];
  deadlines?: string[];
  payment_terms?: string | null;
  amount?: number | null;
  currency?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  confidence?: number;
}

export interface BackendExtractionResponse {
  extraction_id: number;
  parsed: BackendExtractionData;
}

// Frontend Display Format (transformed from backend)
export interface ExtractedData {
  client?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  invoice_details?: {
    number?: string;
    issued_date?: string;
    due_date?: string;
  };
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount?: number;
  }>;
  financial?: {
    subtotal?: number;
    tax?: number;
    total?: number;
  };
  notes?: string;
  confidence?: number;
}

export interface ExtractionResponse {
  extraction_id: number;
  parsed: ExtractedData;
}

// Payment Types
export interface SubscriptionStatus {
  is_pro: boolean;
  subscription_status: string | null;
  subscription_provider: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  days_remaining: number | null;
}

// Dashboard Types
export interface DashboardStats {
  total_clients: number;
  total_invoices: number;
  total_revenue: number;
  pending_amount: number;
  overdue_invoices: number;
}

// API Error Response
export interface APIError {
  detail: string | { msg: string; type: string }[];
}
