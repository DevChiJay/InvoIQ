'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadChat } from '@/components/extraction/upload-chat';
import { ParsedDataEditor } from '@/components/extraction/parsed-data-editor';
import { useExtraction } from '@/lib/hooks/use-extraction';
import { useCreateInvoice } from '@/lib/hooks/use-invoices';
import { useClients } from '@/lib/hooks/use-clients';
import { transformExtractionResponse } from '@/lib/extraction-transformer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ExtractedData, InvoiceCreate } from '@/types/api';

export default function ExtractPage() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  
  const extraction = useExtraction();
  const createInvoice = useCreateInvoice();
  const { data: clients } = useClients();

  const handleExtract = async (formData: FormData) => {
    toast.promise(
      extraction.mutateAsync(formData),
      {
        loading: 'Extracting invoice details with AI...',
        success: (response) => {
          const transformed = transformExtractionResponse(response.data);
          setExtractedData(transformed.parsed);
          return 'Extraction complete! Review the details below.';
        },
        error: 'Failed to extract data. Please try again or enter manually.',
      }
    );
  };

  const handleDataChange = (data: ExtractedData) => {
    setExtractedData(data);
  };

  const handleCreateInvoice = async () => {
    if (!extractedData) return;

    // Check if client exists, otherwise we'll need to create one
    const existingClient = clients?.find(
      (c) => c.email?.toLowerCase() === extractedData.client?.email?.toLowerCase()
    );

    try {
      const invoiceData: InvoiceCreate = {
        client_id: existingClient?.id || 0, // Will need to handle client creation
        issued_date: extractedData.invoice_details?.issued_date || new Date().toISOString().split('T')[0],
        due_date: extractedData.invoice_details?.due_date || '',
        items: (extractedData.line_items || []).map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount || 0,
        })),
        tax: extractedData.financial?.tax || 0,
        notes: extractedData.notes,
      };

      // If no existing client, redirect to invoice creation with pre-filled data
      if (!existingClient) {
        // Store extraction data in session storage for use in invoice creation
        sessionStorage.setItem('extractedInvoiceData', JSON.stringify(invoiceData));
        sessionStorage.setItem('extractedClientData', JSON.stringify(extractedData.client));
        
        toast.info('Client not found. Redirecting to create invoice with client...');
        router.push('/dashboard/invoices/new?from=extraction');
        return;
      }

      // Create invoice directly if client exists
      toast.promise(
        createInvoice.mutateAsync(invoiceData),
        {
          loading: 'Creating invoice...',
          success: (response) => {
            const newInvoice = response.data;
            router.push(`/dashboard/invoices/${newInvoice.id}`);
            return 'Invoice created successfully!';
          },
          error: 'Failed to create invoice. Please try again.',
        }
      );
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                AI Invoice Extraction
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a screenshot or paste invoice text to extract details automatically
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {!extractedData ? (
        // Upload & Extract Step
        <div className="max-w-3xl mx-auto">
          <UploadChat 
            onExtract={handleExtract} 
            isLoading={extraction.isPending}
          />
        </div>
      ) : (
        // Review & Edit Step
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Success Message & Reset Button */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Data Extracted Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    Review and edit the information below, then create your invoice.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtractedData(null);
                  }}
                >
                  Extract Again
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Parsed Data Editor */}
          <ParsedDataEditor
            data={extractedData}
            onChange={handleDataChange}
            onCreateInvoice={handleCreateInvoice}
            isCreating={createInvoice.isPending}
          />
        </div>
      )}
    </div>
  );
}
