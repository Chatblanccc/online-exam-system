import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { ClassManagementClient } from "./class-management-client";

export default async function ClassesPage() {
  await requireAdmin();

  const classes = await prisma.grade.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  return <ClassManagementClient initialClasses={classes} />;
}

