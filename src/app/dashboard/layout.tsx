import { requireAdmin } from "@/lib/session";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-muted/40">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block md:w-64 md:shrink-0 border-r bg-background">
        <AppSidebar className="h-full" />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-6xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
