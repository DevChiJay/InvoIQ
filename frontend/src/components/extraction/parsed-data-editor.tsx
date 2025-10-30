'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { ExtractedData } from '@/types/api';
import { formatCurrency } from '@/lib/format';

interface ParsedDataEditorProps {
  data: ExtractedData;
  onChange: (data: ExtractedData) => void;
  onCreateInvoice: () => void;
  isCreating?: boolean;
}

export function ParsedDataEditor({ data, onChange, onCreateInvoice, isCreating }: ParsedDataEditorProps) {
  const [editedData, setEditedData] = useState<ExtractedData>(data);

  // Update when data prop changes
  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const updateClient = (field: string, value: string) => {
    const updated = {
      ...editedData,
      client: { ...editedData.client, [field]: value },
    };
    setEditedData(updated);
    onChange(updated);
  };

  const updateInvoiceDetail = (field: string, value: string) => {
    const updated = {
      ...editedData,
      invoice_details: { ...editedData.invoice_details, [field]: value },
    };
    setEditedData(updated);
    onChange(updated);
  };

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const items = [...(editedData.line_items || [])];
    items[index] = { ...items[index], [field]: value };
    
    // Recalculate amount if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      items[index].amount = items[index].quantity * items[index].unit_price;
    }

    const updated = { ...editedData, line_items: items };
    recalculateTotals(updated);
    setEditedData(updated);
    onChange(updated);
  };

  const addLineItem = () => {
    const items = [...(editedData.line_items || [])];
    items.push({ description: '', quantity: 1, unit_price: 0, amount: 0 });
    const updated = { ...editedData, line_items: items };
    setEditedData(updated);
    onChange(updated);
  };

  const removeLineItem = (index: number) => {
    const items = [...(editedData.line_items || [])];
    items.splice(index, 1);
    const updated = { ...editedData, line_items: items };
    recalculateTotals(updated);
    setEditedData(updated);
    onChange(updated);
  };

  const recalculateTotals = (updated: ExtractedData) => {
    const subtotal = (updated.line_items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax = updated.financial?.tax || 0;
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount;

    updated.financial = {
      subtotal,
      tax,
      total,
    };
  };

  const updateTax = (tax: number) => {
    const updated = { ...editedData };
    if (!updated.financial) updated.financial = { subtotal: 0, tax: 0, total: 0 };
    updated.financial.tax = tax;
    recalculateTotals(updated);
    setEditedData(updated);
    onChange(updated);
  };

  const updateNotes = (notes: string) => {
    const updated = { ...editedData, notes };
    setEditedData(updated);
    onChange(updated);
  };

  const subtotal = editedData.financial?.subtotal || 0;
  const tax = editedData.financial?.tax || 0;
  const total = editedData.financial?.total || 0;

  return (
    <div className="space-y-6">
      {/* Confidence Score */}
      {editedData.confidence !== undefined && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Extraction Complete</p>
                  <p className="text-sm text-muted-foreground">
                    Review and edit the extracted data below
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg font-semibold">
                {Math.round(editedData.confidence * 100)}% Confidence
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>Review and edit client details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                value={editedData.client?.name || ''}
                onChange={(e) => updateClient('name', e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={editedData.client?.email || ''}
                onChange={(e) => updateClient('email', e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone (Optional)</Label>
              <Input
                id="client-phone"
                value={editedData.client?.phone || ''}
                onChange={(e) => updateClient('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-address">Address (Optional)</Label>
              <Input
                id="client-address"
                value={editedData.client?.address || ''}
                onChange={(e) => updateClient('address', e.target.value)}
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Set invoice dates and number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice Number (Optional)</Label>
              <Input
                id="invoice-number"
                value={editedData.invoice_details?.number || ''}
                onChange={(e) => updateInvoiceDetail('number', e.target.value)}
                placeholder="Auto-generated"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued-date">Issued Date</Label>
              <Input
                id="issued-date"
                type="date"
                value={editedData.invoice_details?.issued_date || new Date().toISOString().split('T')[0]}
                onChange={(e) => updateInvoiceDetail('issued_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={editedData.invoice_details?.due_date || ''}
                onChange={(e) => updateInvoiceDetail('due_date', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Services or products provided</CardDescription>
            </div>
            <Button onClick={addLineItem} size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editedData.line_items?.map((item, index) => (
            <div key={index} className="flex gap-4 items-start p-4 rounded-lg border bg-muted/30">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder="Service or product description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 pt-8">
                <p className="font-semibold">{formatCurrency(item.amount || 0)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLineItem(index)}
                  disabled={(editedData.line_items?.length || 0) <= 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Totals & Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Totals & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <Label htmlFor="tax">Tax (%):</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tax}
                  onChange={(e) => updateTax(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="font-medium min-w-[100px] text-right">
                  {formatCurrency((subtotal * tax) / 100)}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={editedData.notes || ''}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="Payment terms, special instructions, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Invoice Button */}
      <Button
        onClick={onCreateInvoice}
        size="lg"
        className="w-full"
        disabled={isCreating || !editedData.client?.name || !editedData.client?.email || (editedData.line_items?.length || 0) === 0}
      >
        {isCreating ? 'Creating Invoice...' : 'Create Invoice'}
      </Button>
    </div>
  );
}
