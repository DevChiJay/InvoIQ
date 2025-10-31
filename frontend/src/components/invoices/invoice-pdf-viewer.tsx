"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InvoicePDFTemplate } from "./invoice-pdf-template";
import type { Invoice, Client } from "@/types/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InvoicePDFViewerProps {
  invoice: Invoice;
  client?: Client;
}

export function InvoicePDFViewer({ invoice, client }: InvoicePDFViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  const handleGeneratePDF = async () => {
    if (!templateRef.current) {
      toast.error("PDF template not ready");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("Generating PDF...");

    try {
      // Capture the HTML content as canvas with ignoreElements to skip problematic styles
      const canvas = await html2canvas(templateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Ignore any elements that might have problematic styles
          return element.tagName === 'STYLE' || element.tagName === 'LINK';
        },
        onclone: (clonedDoc) => {
          // Remove all stylesheets from the cloned document
          const styleSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
          styleSheets.forEach(sheet => sheet.remove());
          
          // Ensure the template is visible in the clone
          const clonedTemplate = clonedDoc.querySelector('[data-pdf-template]');
          if (clonedTemplate) {
            (clonedTemplate as HTMLElement).style.cssText = 'position: static !important; left: auto !important; top: auto !important;';
          }
        }
      });

      // Calculate PDF dimensions (A4 size)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Generate blob URL for preview
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      toast.success("PDF generated successfully!", { id: loadingToast });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!templateRef.current) {
      toast.error("PDF template not ready");
      return;
    }

    const loadingToast = toast.loading("Preparing download...");

    try {
      // Capture the HTML content as canvas with ignoreElements to skip problematic styles
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          return element.tagName === 'STYLE' || element.tagName === 'LINK';
        },
        onclone: (clonedDoc) => {
          // Remove all stylesheets from the cloned document
          const styleSheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
          styleSheets.forEach(sheet => sheet.remove());
          
          // Ensure the template is visible in the clone
          const clonedTemplate = clonedDoc.querySelector('[data-pdf-template]');
          if (clonedTemplate) {
            (clonedTemplate as HTMLElement).style.cssText = 'position: static !important; left: auto !important; top: auto !important;';
          }
        }
      });

      // Calculate PDF dimensions
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download the PDF
      pdf.save(`invoice-${invoice.number}.pdf`);

      toast.success("Download started!", { id: loadingToast });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF", { id: loadingToast });
    }
  };

  return (
    <>
      {/* Hidden PDF Template for rendering */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <InvoicePDFTemplate
          ref={templateRef}
          invoice={invoice}
          client={client}
        />
      </div>

      {/* UI Card */}
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
    </>
  );
}
