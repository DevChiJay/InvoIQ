'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { ExtractionResponse } from '@/types/api';
import { format } from 'date-fns';

interface DemoInvoicePreviewProps {
  extractionData: ExtractionResponse;
}

export default function DemoInvoicePreview({ extractionData }: DemoInvoicePreviewProps) {
  const { parsed } = extractionData;

  // Calculate totals from line items if not provided
  const calculateSubtotal = () => {
    if (parsed.financial?.subtotal) return parsed.financial.subtotal;
    if (!parsed.line_items || parsed.line_items.length === 0) return 0;
    return parsed.line_items.reduce((sum, item) => sum + (item.amount || item.quantity * item.unit_price), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = parsed.financial?.tax || 0;
  const total = parsed.financial?.total || (subtotal + tax);
  const confidence = parsed.confidence || 0;

  return (
    <Card className="max-w-3xl mx-auto border-2">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-b-2 border-teal-100 dark:border-teal-900">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Extracted Invoice Data</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1">
              ✓ Extracted
            </Badge>
            {confidence > 0 && (
              <Badge variant="outline" className="border-teal-600 text-teal-700 dark:text-teal-300 px-3 py-1">
                {confidence}% Confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Invoice Details */}
        {parsed.invoice_details && (parsed.invoice_details.number || parsed.invoice_details.issued_date || parsed.invoice_details.due_date) && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {parsed.invoice_details.number && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Number</label>
                  <p className="text-lg font-semibold">{parsed.invoice_details.number}</p>
                </div>
              )}
              {parsed.invoice_details.issued_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</label>
                  <p className="text-lg font-semibold">
                    {format(new Date(parsed.invoice_details.issued_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {parsed.invoice_details.due_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</label>
                  <p className="text-lg font-semibold">
                    {format(new Date(parsed.invoice_details.due_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
            <Separator />
          </>
        )}

        {/* Client Information */}
        {parsed.client && (parsed.client.name || parsed.client.email || parsed.client.address) && (
          <>
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Client Information</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                {parsed.client.name && <p className="font-medium text-lg">{parsed.client.name}</p>}
                {parsed.client.email && <p className="text-sm text-gray-600 dark:text-gray-400">{parsed.client.email}</p>}
                {parsed.client.phone && <p className="text-sm text-gray-600 dark:text-gray-400">{parsed.client.phone}</p>}
                {parsed.client.address && <p className="text-sm text-gray-600 dark:text-gray-400">{parsed.client.address}</p>}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Line Items */}
        {parsed.line_items && parsed.line_items.length > 0 && (
          <>
            <div>
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Services / Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Qty</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Rate</th>
                      <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.line_items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">${item.unit_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${(item.amount || item.quantity * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax:</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {parsed.notes && (
          <>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{parsed.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
