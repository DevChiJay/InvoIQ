'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInvoice, useDeleteInvoice, useUpdateInvoice } from '@/lib/hooks/use-invoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, ArrowLeft, Download, Send } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeDate, formatSimpleDate, formatCurrency } from '@/lib/format';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = parseInt(params.id as string);
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const deleteInvoice = useDeleteInvoice();
  const updateInvoice = useUpdateInvoice(invoiceId);

  const handleDelete = () => {
    if (
      window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')
    ) {
      deleteInvoice.mutate(invoiceId, {
        onSuccess: () => {
          router.push('/dashboard/invoices');
        },
      });
    }
  };

  const handleStatusChange = (status: 'draft' | 'sent' | 'paid' | 'overdue') => {
    updateInvoice.mutate({ status });
  };

  const getStatusBadgeVariant = (status: string) => {
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
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">{invoice.number}</h2>
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {formatRelativeDate(invoice.issued_date)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteInvoice.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Invoice Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bill To</p>
                <p className="font-semibold">{invoice.client?.name || `Client #${invoice.client_id}`}</p>
                {invoice.client?.email && <p className="text-sm">{invoice.client.email}</p>}
                {invoice.client?.address && (
                  <p className="text-sm text-muted-foreground">{invoice.client.address}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dates</p>
                <p className="text-sm">
                  <span className="font-medium">Issued:</span>{' '}
                  {formatSimpleDate(invoice.issued_date)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Due:</span>{' '}
                  {formatSimpleDate(invoice.due_date)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Line Items */}
            <div>
              <h4 className="font-semibold mb-4">Items</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({invoice.tax}%):</span>
                <span>{formatCurrency((invoice.subtotal * invoice.tax) / 100)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={invoice.status === 'draft' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleStatusChange('draft')}
                disabled={updateInvoice.isPending}
              >
                Mark as Draft
              </Button>
              <Button
                variant={invoice.status === 'sent' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleStatusChange('sent')}
                disabled={updateInvoice.isPending}
              >
                Mark as Sent
              </Button>
              <Button
                variant={invoice.status === 'paid' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleStatusChange('paid')}
                disabled={updateInvoice.isPending}
              >
                Mark as Paid
              </Button>
              <Button
                variant={invoice.status === 'overdue' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleStatusChange('overdue')}
                disabled={updateInvoice.isPending}
              >
                Mark as Overdue
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>
                <Send className="mr-2 h-4 w-4" />
                Send to Client
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/clients/${invoice.client_id}`}>
                  View Client
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
