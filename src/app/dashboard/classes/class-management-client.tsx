"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClassActions } from "./class-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassWithCount {
  id: string;
  name: string;
  status: "ACTIVE" | "DISABLED";
  _count: {
    users: number;
  };
}

interface ClassManagementClientProps {
  initialClasses: ClassWithCount[];
}

export function ClassManagementClient({ initialClasses }: ClassManagementClientProps) {
  const router = useRouter();
  const [newClassName, setNewClassName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "创建失败");
      }

      toast.success("班级创建成功");
      setNewClassName("");
      setIsAddDialogOpen(false);
      router.refresh();
      // Optimistic update (optional, but router.refresh might be slow)
      // fetch again or rely on router.refresh
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (classId: string, status: "ACTIVE" | "DISABLED") => {
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "更新失败");
      }

      toast.success(status === "ACTIVE" ? "班级已启用" : "班级已禁用");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "删除失败");
      }

      toast.success("班级已删除");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">班级管理</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 创建班级
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新班级</DialogTitle>
              <DialogDescription>
                输入班级名称以创建一个新的班级实体。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">班级名称</Label>
                <Input
                  id="name"
                  placeholder="例如：2024级1班"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={loading}>
                取消
              </Button>
              <Button onClick={handleAddClass} disabled={loading}>
                {loading ? "创建中..." : "创建班级"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>所有班级</CardTitle>
          <CardDescription>
            管理系统中的所有班级信息。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>班级名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>学生人数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    <Badge variant={cls.status === "ACTIVE" ? "secondary" : "destructive"} className={cls.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {cls.status === "ACTIVE" ? "启用中" : "已禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {cls._count.users}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ClassActions 
                      classItem={cls} 
                      onStatusChange={(status) => handleStatusChange(cls.id, status)}
                      onDelete={() => handleDeleteClass(cls.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {initialClasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    暂无班级数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

