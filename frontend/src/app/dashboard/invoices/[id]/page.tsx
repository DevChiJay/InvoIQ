'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInvoice, useDeleteInvoice } from '@/lib/hooks/use-invoices';
import { useClient } from '@/lib/hooks/use-clients';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InvoicePreview } from '@/components/invoices/invoice-preview';
import { InvoicePDFViewer } from '@/components/invoices/invoice-pdf-viewer';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeDate } from '@/lib/format';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = parseInt(params.id as string);
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const { data: client } = useClient(invoice?.client_id || 0);
  const deleteInvoice = useDeleteInvoice();

  const handleDelete = () => {
    toast.promise(
      new Promise((resolve, reject) => {
        deleteInvoice.mutate(invoiceId, {
          onSuccess: () => {
            router.push('/dashboard/invoices');
            resolve(true);
          },
          onError: reject,
        });
      }),
      {
        loading: 'Deleting invoice...',
        success: 'Invoice deleted successfully',
        error: 'Failed to delete invoice',
      }
    );
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="font-semibold text-lg mb-2">Invoice not found</h3>
              <p className="text-sm text-muted-foreground">
                The invoice you&apos;re looking for doesn&apos;t exist.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{invoice.number}</h2>
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {formatRelativeDate(invoice.issued_date)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete} 
            disabled={deleteInvoice.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice Preview with Client Info */}
      <InvoicePreview invoice={invoice} client={client} />

      {/* PDF Viewer */}
      <InvoicePDFViewer invoiceId={invoice.id} />
    </div>
  );
}
