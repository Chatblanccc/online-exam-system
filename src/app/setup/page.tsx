import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import SetupForm from "./setup-form";

export default async function SetupPage() {
  const existing = await prisma.user.findFirst();
  // if (existing) {
  //   redirect("/login");
  // }

  return <SetupForm />;
}
