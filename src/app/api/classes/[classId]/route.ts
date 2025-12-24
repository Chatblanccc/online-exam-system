import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;

  try {
    // Check if class has students
    const studentCount = await prisma.user.count({
      where: { classId },
    });

    if (studentCount > 0) {
      return NextResponse.json(
        { error: "该班级下仍有学生，无法删除" },
        { status: 400 }
      );
    }

    await prisma.grade.delete({
      where: { id: classId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

