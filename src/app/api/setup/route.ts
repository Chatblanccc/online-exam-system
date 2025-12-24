import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { Role } from "@/generated/prisma/client";

const payloadSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const existing = await prisma.user.findFirst();
  if (existing) {
    return NextResponse.json(
      { error: "Setup already completed" },
      { status: 409 },
    );
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const username = parsed.data.username.trim();
  const name = parsed.data.name.trim();
  if (!username || !name) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const hashed = hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      username,
      name,
      password: hashed,
      role: Role.ADMIN,
    },
  });

  return NextResponse.json({ userId: user.id });
}

