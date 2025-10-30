"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvoicePDFViewerProps {
  invoiceId: number;
}

export function InvoicePDFViewer({ invoiceId }: InvoicePDFViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/invoices/${invoiceId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    toast.promise(
      (async () => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })(),
      {
        loading: "Preparing download...",
        success: "Download started!",
        error: "Failed to download PDF",
      }
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Invoice PDF</h3>
            </div>
            
            {!pdfUrl ? (
              <Button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>

          {pdfUrl && (
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[600px]"
                title="Invoice PDF Preview"
              />
            </div>
          )}

          {!pdfUrl && !isGenerating && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Click &ldquo;Generate PDF&rdquo; to create a downloadable invoice</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
