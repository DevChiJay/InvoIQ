import type { BackendExtractionResponse, ExtractionResponse, ExtractedData } from '@/types/api';

/**
 * Transforms the backend extraction response to frontend display format
 */
export function transformExtractionResponse(backendResponse: BackendExtractionResponse): ExtractionResponse {
  const { extraction_id, parsed } = backendResponse;

  // Transform backend format to frontend display format
  const transformedData: ExtractedData = {
    client: {
      name: parsed.client_name || undefined,
      email: parsed.client_email || undefined,
      address: parsed.client_address || undefined,
    },
    invoice_details: {
      // Use the first deadline as due date if available
      due_date: parsed.deadlines?.[0] || undefined,
    },
    line_items: parsed.jobs?.map((job) => ({
      description: job,
      quantity: 1,
      unit_price: parsed.amount || 0,
      amount: parsed.amount || 0,
    })) || [],
    financial: {
      subtotal: parsed.amount || 0,
      tax: 0,
      total: parsed.amount || 0,
    },
    notes: parsed.payment_terms || undefined,
    confidence: parsed.confidence,
  };

  return {
    extraction_id,
    parsed: transformedData,
  };
}

/**
 * Creates a sample invoice text for demo purposes
 */
export const SAMPLE_INVOICE_TEXT = `INVOICE

From: Acme Design Studio
123 Creative Ave, Design City, CA 90210
Email: contact@acmedesign.com
Phone: (555) 123-4567

Bill To: TechCorp Solutions
Contact: billing@techcorp.com
Address: 456 Innovation Blvd, San Francisco, CA 94105

Invoice Date: January 15, 2024
Due Date: February 15, 2024

SERVICES PROVIDED:
1. Website Redesign - $5,000.00
2. Logo Design - $1,500.00
3. Brand Guidelines - $1,000.00

TOTAL AMOUNT: $7,500.00

Payment Terms: Net 30 days
Please remit payment via bank transfer or check.

Thank you for your business!`;
