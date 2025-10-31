'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadChat } from '@/components/extraction/upload-chat';
import { ParsedDataEditor } from '@/components/extraction/parsed-data-editor';
import { useExtraction } from '@/lib/hooks/use-extraction';
import { transformExtractionResponse } from '@/lib/extraction-transformer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ExtractedData } from '@/types/api';

export default function ExtractPage() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  
  const extraction = useExtraction();

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

    // Store extraction data in session storage for use in invoice creation
    sessionStorage.setItem('extractedData', JSON.stringify(extractedData));
    
    toast.success('Extraction complete! Redirecting to create invoice...');
    router.push('/dashboard/invoices/new?from=extraction');
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
            onContinue={handleCreateInvoice}
          />
        </div>
      )}
    </div>
  );
}
