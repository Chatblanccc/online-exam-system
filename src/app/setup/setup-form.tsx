"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SetupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name, password }),
    });

    setLoading(false);

    if (!response.ok) {
      toast.error("初始化失败，请检查输入。");
      return;
    }

    toast.success("管理员账号已创建。");
    router.push("/login");
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fdf7ef,_#efe3d1_55%,_#e0d2c0)] px-6 font-sans"
      style={
        {
          "--shell-border": "rgba(17, 24, 39, 0.12)",
          "--shell-surface": "rgba(255, 255, 255, 0.86)",
          "--shell-muted": "rgba(17, 24, 39, 0.55)",
          "--shell-ink": "#111827",
        } as CSSProperties
      }
    >
      <Card className="w-full max-w-md border border-[var(--shell-border)] bg-[var(--shell-surface)] p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--shell-muted)]">
            Initial Setup
          </p>
          <h1 className="text-2xl font-semibold text-[var(--shell-ink)]">
            创建管理员
          </h1>
          <p className="text-sm text-[var(--shell-muted)]">
            首次部署请先创建教师账号。
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? "创建中..." : "创建管理员账号"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
