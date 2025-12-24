import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { StudentManagementClient } from "./student-management-client";

export default async function StudentsPage() {
  await requireAdmin();

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      name: true,
      status: true,
      createdAt: true,
      classId: true,
      grade: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { exams: true },
      },
    },
  });

  return <StudentManagementClient initialStudents={students} />;
}
