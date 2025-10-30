'use client';

import { useInvoices, useDeleteInvoice } from '@/lib/hooks/use-invoices';
import { InvoiceList } from '@/components/invoices/invoice-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();

  const handleDelete = (id: number) => {
    toast.promise(
      new Promise((resolve, reject) => {
        deleteInvoice.mutate(id, {
          onSuccess: resolve,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage and track all your invoices
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <InvoiceList
        invoices={invoices || []}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
