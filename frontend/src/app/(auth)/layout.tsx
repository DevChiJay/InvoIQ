export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-gray-900 dark:via-teal-950 dark:to-gray-900">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
