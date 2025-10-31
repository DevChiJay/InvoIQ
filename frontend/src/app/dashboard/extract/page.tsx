'use client';

import { useRouter } from 'next/navigation';
import { UploadChat } from '@/components/extraction/upload-chat';
import { useExtraction } from '@/lib/hooks/use-extraction';
import { transformExtractionResponse } from '@/lib/extraction-transformer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ExtractPage() {
  const router = useRouter();
  const extraction = useExtraction();

  const handleExtract = async (formData: FormData) => {
    const loadingToast = toast.loading('Extracting invoice details with AI...');
    
    try {
      const response = await extraction.mutateAsync(formData);

      // Transform and store the extracted data
      const transformed = transformExtractionResponse(response.data);
      sessionStorage.setItem('extractedData', JSON.stringify(transformed.parsed));
      
      toast.success('Extraction complete! Redirecting to create invoice...', {
        id: loadingToast, // Replace the loading toast
      });
      
      // Redirect directly to invoice form
      router.push('/dashboard/invoices/new?from=extraction');
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('Failed to extract data. Please try again or enter manually.', {
        id: loadingToast, // Replace the loading toast
      });
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
              Upload a screenshot or paste invoice text to extract and create invoice
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Extract */}
      <div className="max-w-3xl mx-auto">
        <UploadChat 
          onExtract={handleExtract} 
          isLoading={extraction.isPending}
        />
      </div>
    </div>
  );
}
