'use client';

import { useClients, useDeleteClient } from '@/lib/hooks/use-clients';
import { ClientList } from '@/components/clients/client-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClient.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client information and contacts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <ClientList
        clients={clients || []}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  );
}
