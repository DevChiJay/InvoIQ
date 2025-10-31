'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatSimpleDate, formatRelativeDate } from '@/lib/format';
import { Building2 } from 'lucide-react';
import type { Invoice, Client } from '@/types/api';

interface InvoicePreviewProps {
  invoice: Invoice;
  client?: Client;
}

export function InvoicePreview({ 
  invoice, 
  client,
}: InvoicePreviewProps) {
  // Use business info from invoice (with fallbacks)
  const userInfo = invoice.user_business_info;
  const companyName = userInfo?.company_name || userInfo?.full_name || 'InvoIQ';
  const companyEmail = userInfo?.email || 'hello@invoiq.com';
  const companyPhone = userInfo?.phone;
  const companyAddress = userInfo?.company_address;
  const companyLogoUrl = userInfo?.company_logo_url;
  const taxId = userInfo?.tax_id;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const subtotal = invoice.subtotal || invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * (invoice.tax || 0)) / 100;
  const total = invoice.total || subtotal + taxAmount;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8 sm:p-12">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-12">
          {/* Company Info with Logo */}
          <div className="flex items-start gap-4">
            {companyLogoUrl ? (
              <div className="w-16 h-16 shrink-0">
                <img 
                  src={companyLogoUrl} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{companyName}</h1>
              <div className="text-sm text-muted-foreground space-y-0.5">
                {companyEmail && <p>{companyEmail}</p>}
                {companyPhone && <p>{companyPhone}</p>}
                {companyAddress && <p className="whitespace-pre-line">{companyAddress}</p>}
                {taxId && <p>Tax ID: {taxId}</p>}
              </div>
            </div>
          </div>

          {/* Invoice Title & Status */}
          <div className="text-left sm:text-right">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">INVOICE</h2>
            <p className="text-lg font-semibold text-muted-foreground mb-3">#{invoice.number}</p>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bill To & Invoice Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          {/* Bill To */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Bill To</h3>
            <div className="space-y-1">
              <p className="font-bold text-foreground text-lg">{client?.name || 'Unknown Client'}</p>
              {client?.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
              {client?.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
              {client?.address && (
                <p className="text-sm text-muted-foreground whitespace-pre-line mt-2">{client.address}</p>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Invoice Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-semibold text-foreground">{formatRelativeDate(invoice.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Issue Date:</span>
                <span className="font-semibold text-foreground">{formatSimpleDate(invoice.issued_date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="font-semibold text-foreground">{formatSimpleDate(invoice.due_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">
                    Qty
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider w-28">
                    Unit Price
                  </th>
                  <th className="text-right py-3 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider w-32">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-4 px-2 text-sm text-foreground">{item.description}</td>
                    <td className="py-4 px-2 text-sm text-foreground text-right">{Number(item.quantity)}</td>
                    <td className="py-4 px-2 text-sm text-foreground text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-4 px-2 text-sm font-semibold text-foreground text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-full sm:w-80 space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Subtotal:</span>
              <span className="text-sm font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Tax ({invoice.tax}%):</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-4 bg-muted rounded-lg">
              <span className="text-lg font-bold text-foreground">Total:</span>
              <span className="text-lg font-bold text-foreground">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <>
            <Separator className="my-8" />
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Notes</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {invoice.notes}
              </p>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator className="my-8" />
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Thank you for your business! • Generated by InvoIQ
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
