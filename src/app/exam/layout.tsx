import { requireStudent } from "@/lib/session";
import { AppHeader } from "@/components/layout/app-header";

export default async function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStudent();

  return (
    <div className="min-h-screen w-full bg-muted/40 flex flex-col">
       <AppHeader user={session.user} />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 h-full">
        {children}
      </main>
    </div>
  );
}
