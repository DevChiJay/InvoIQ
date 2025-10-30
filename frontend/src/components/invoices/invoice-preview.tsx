'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatSimpleDate } from '@/lib/format';
import { Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import type { Invoice, Client } from '@/types/api';

interface InvoicePreviewProps {
  invoice: Invoice;
  client?: Client;
}

export function InvoicePreview({ invoice, client }: InvoicePreviewProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Invoice Details - Takes 2 columns on large screens */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Invoice #{invoice.number}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {invoice.client?.name || 'Unknown Client'}
                </p>
              </div>
              {getStatusBadge(invoice.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Issued Date</span>
                </div>
                <p className="text-sm font-medium">{formatSimpleDate(invoice.issued_date)}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due Date</span>
                </div>
                <p className="text-sm font-medium">{formatSimpleDate(invoice.due_date)}</p>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Items
              </h3>
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({invoice.tax}%)</span>
                  <span className="font-medium">
                    {formatCurrency((invoice.subtotal * invoice.tax) / 100)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Information - Takes 1 column on large screens */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client ? (
              <>
                <div>
                  <h3 className="font-semibold text-lg">{client.name}</h3>
                </div>

                {client.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${client.email}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${client.phone}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-sm font-medium whitespace-pre-wrap">
                        {client.address}
                      </p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Client since {formatSimpleDate(client.created_at)}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Client information not available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
