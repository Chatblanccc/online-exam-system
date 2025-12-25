import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

export async function GET() {
  // Allow unauthenticated access for registration dropdown
  // Only return ACTIVE classes for registration
  const classes = await prisma.grade.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { users: true },
      },
    },
  });

  return NextResponse.json({ classes });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newClass = await prisma.grade.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({ class: newClass });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "班级名称已存在" }, { status: 400 });
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}

