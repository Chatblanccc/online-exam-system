import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Role } from "@/generated/prisma/client";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role === Role.ADMIN) {
    redirect("/dashboard/overview");
  }
  redirect("/exam");
}

