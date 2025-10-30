'use client';

import { useRouter } from 'next/navigation';
import { useCreateClient } from '@/lib/hooks/use-clients';
import { ClientForm } from '@/components/clients/client-form';
import type { ClientCreate, ClientUpdate } from '@/types/api';

export default function NewClientPage() {
  const router = useRouter();
  const createClient = useCreateClient();

  const handleSubmit = (data: ClientCreate | ClientUpdate) => {
    createClient.mutate(data as ClientCreate, {
      onSuccess: () => {
        router.push('/dashboard/clients');
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add New Client</h2>
        <p className="text-muted-foreground">
          Create a new client profile for invoicing
        </p>
      </div>

      <ClientForm
        onSubmit={handleSubmit}
        isLoading={createClient.isPending}
      />
    </div>
  );
}
