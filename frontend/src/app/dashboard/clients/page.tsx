'use client';

import { useClients, useDeleteClient } from '@/lib/hooks/use-clients';
import { ClientList } from '@/components/clients/client-list';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { ClientFormModal } from '@/components/clients/client-form-modal';
import { toast } from 'sonner';

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const handleDelete = (id: number) => {
    toast.promise(
      new Promise((resolve, reject) => {
        deleteClient.mutate(id, {
          onSuccess: resolve,
          onError: reject,
        });
      }),
      {
        loading: 'Deleting client...',
        success: 'Client deleted successfully',
        error: 'Failed to delete client',
      }
    );
  };

  return (
    <div className="space-y-6">
      <ClientFormModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client information and contacts
          </p>
        </div>
        <Button onClick={() => setIsClientModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
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
