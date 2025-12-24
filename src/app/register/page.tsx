"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Command } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ParticleBackground } from "@/components/ui/particle-background";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        if (res.ok) {
          setClasses(data.classes);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (!classId) {
      setError("请选择您的班级");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, password, classId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "注册失败");
      }

      toast.success("注册提交成功，请等待管理员审核通过后登录。");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              &ldquo;加入我们的学习平台，开启您的知识之旅。&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex h-full items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              注册学生账户
            </h1>
            <p className="text-sm text-muted-foreground">
              请输入您的详细信息以创建账户
            </p>
          </div>
          <div className={cn("grid gap-6")}>
            <form onSubmit={onSubmit}>
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="username">
                    用户名
                  </Label>
                  <Input
                    id="username"
                    placeholder="用户名"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={loading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Label className="sr-only" htmlFor="name">
                    真实姓名
                  </Label>
                  <Input
                    id="name"
                    placeholder="真实姓名"
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={loading}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  
                  <div className="grid gap-1 mt-1">
                    <Select onValueChange={setClassId} value={classId} disabled={loading}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择班级" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                        {classes.length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            暂无班级数据，请联系管理员
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Label className="sr-only" htmlFor="password">
                    密码
                  </Label>
                  <Input
                    id="password"
                    placeholder="密码"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Label className="sr-only" htmlFor="confirmPassword">
                    确认密码
                  </Label>
                  <Input
                    id="confirmPassword"
                    placeholder="确认密码"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                <Button disabled={loading}>
                  {loading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                  注册账户
                </Button>
              </div>
            </form>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            已有账户？{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
