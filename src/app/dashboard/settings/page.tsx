import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { SettingsClient } from "./settings-client";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">账户设置</h1>
        <p className="text-muted-foreground">
          在这里管理您的个人信息和账户安全。
        </p>
      </header>

      <SettingsClient initialUser={user} />
    </div>
  );
}

