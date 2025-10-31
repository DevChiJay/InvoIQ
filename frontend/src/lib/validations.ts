import { z } from 'zod';

// Client Validation Schemas
export const clientCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export const clientUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

// Invoice Item Schema
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
  amount: z.number().min(0, 'Amount must be positive'),
});

// Invoice Validation Schemas
export const invoiceCreateSchema = z.object({
  client_id: z.number().min(1, 'Client is required'),
  issued_date: z.string().min(1, 'Issued date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  tax: z.number().min(0, 'Tax must be positive').max(100, 'Tax cannot exceed 100%').optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Ensure due date is after issued date
  const issued = new Date(data.issued_date);
  const due = new Date(data.due_date);
  return due >= issued;
}, {
  message: 'Due date must be on or after issued date',
  path: ['due_date'],
});

export const invoiceUpdateSchema = z.object({
  client_id: z.number().min(1, 'Client is required').optional(),
  issued_date: z.string().optional(),
  due_date: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required').optional(),
  tax: z.number().min(0, 'Tax must be positive').max(100, 'Tax cannot exceed 100%').optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']).optional(),
  notes: z.string().optional(),
});

// Auth Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/\d/, 'Password must contain at least 1 number'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
});

// Export types
export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
