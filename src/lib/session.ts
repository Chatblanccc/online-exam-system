import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Role } from "@/generated/prisma/client";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (session.user?.role !== role) {
    redirect("/");
  }
  return session;
}

export async function requireAdmin() {
  return requireRole(Role.ADMIN);
}

export async function requireStudent() {
  return requireRole(Role.STUDENT);
}

