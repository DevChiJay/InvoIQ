'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white dark:bg-[#0F172A] border-b-2 border-indigo-100 dark:border-[#6366F1]/20 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">InvoIQ</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center text-white font-semibold text-sm">
                {user?.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-[#E2E8F0]">{user?.full_name}</p>
                <p className="text-xs text-gray-500 dark:text-[#E2E8F0]/60">{user?.email}</p>
              </div>
            </div>
            
            {user?.is_pro && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white">
                PRO
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-[#6366F1]/10 dark:hover:bg-[#6366F1]/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
