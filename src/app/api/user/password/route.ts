import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "当前密码和新密码不能为空" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 验证当前密码
    const isValid = verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "当前密码不正确" }, { status: 400 });
    }

    // 更新新密码
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashPassword(newPassword),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "密码更新失败" },
      { status: 500 }
    );
  }
}

