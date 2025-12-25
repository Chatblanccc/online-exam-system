"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Command } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ParticleBackground } from "@/components/ui/particle-background";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("用户名或密码错误，或账户未审核。");
      return;
    }

    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white lg:flex dark:border-r overflow-hidden">
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Command className="mr-2 h-6 w-6" />
            ExamSystem Inc
          </div>
        </div>
        <div className="lg:p-8 flex h-full items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <div className="h-8 w-48 bg-muted animate-pulse mx-auto rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse mx-auto rounded mt-2" />
            </div>
            <div className="grid gap-6">
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900">
           <ParticleBackground />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium pointer-events-none">
          <Command className="mr-2 h-6 w-6" />
          ExamSystem Inc
        </div>
        <div className="relative z-20 mt-auto pointer-events-none">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;这个在线考试系统彻底改变了我们的考核方式。界面简洁，功能强大，是现代化教育的完美选择。&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex h-full items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              登录账户
            </h1>
            <p className="text-sm text-muted-foreground">
              请输入您的用户名和密码进入系统
            </p>
          </div>
          <div className={cn("grid gap-6")}>
            <form onSubmit={onSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-5">
                  <Label className="sr-only" htmlFor="username">
                    用户名
                  </Label>
                  <Input
                    id="username"
                    placeholder="用户名"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                    disabled={loading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Label className="sr-only" htmlFor="password">
                    密码
                  </Label>
                  <Input
                    id="password"
                    placeholder="密码"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect="off"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <Button disabled={loading}>
                  {loading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                  登录
                </Button>
              </div>
            </form>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            没有账户？{" "}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              注册新账户
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
