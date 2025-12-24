"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Shield, Clock, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StudentActions } from "./student-actions";

type Student = {
  id: string;
  username: string;
  name: string;
  status: "PENDING" | "ACTIVE" | "REJECTED";
  createdAt: Date;
  grade?: {
    name: string;
  } | null;
  _count: {
    exams: number;
  };
};

export function StudentManagementClient({
  initialStudents,
}: {
  initialStudents: Student[];
}) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter(
    (s) =>
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.grade?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (userId: string, newStatus: "ACTIVE" | "REJECTED") => {
    try {
      const res = await fetch(`/api/students/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setStudents((prev) =>
        prev.map((s) => (s.id === userId ? { ...s, status: newStatus } : s))
      );
      toast.success(newStatus === "ACTIVE" ? "账户已激活" : "账户已禁用");
    } catch (error) {
      toast.error("更新状态失败");
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const res = await fetch(`/api/students/${userId}/reset-password`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to reset password");

      toast.success("密码已成功重置为 Ab123456");
    } catch (error) {
      toast.error("密码重置失败");
    }
  };

  const handleDeleteStudent = async (userId: string) => {
    try {
      const res = await fetch(`/api/students/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete student");

      setStudents((prev) => prev.filter((s) => s.id !== userId));
      toast.success("学生已成功删除");
    } catch (error) {
      toast.error("删除学生失败");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">学生管理</h2>
          <p className="text-muted-foreground">
            管理学生账户及注册审核。
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>学生列表</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、姓名或班级..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            查看所有注册学生及其状态。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>班级</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>提交考试数</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {student.grade?.name || "未分配"}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell>{format(new Date(student.createdAt), "yyyy-MM-dd")}</TableCell>
                  <TableCell>{student._count.exams}</TableCell>
                  <TableCell>
                    {student.status === "PENDING" && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="mr-1 h-3 w-3" /> 待审核
                      </Badge>
                    )}
                    {student.status === "ACTIVE" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Shield className="mr-1 h-3 w-3" /> 已激活
                      </Badge>
                    )}
                    {student.status === "REJECTED" && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <X className="mr-1 h-3 w-3" /> 已拒绝
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <StudentActions 
                      student={student}
                      onStatusChange={(status) => handleStatusChange(student.id, status)}
                      onResetPassword={() => handleResetPassword(student.id)}
                      onDelete={() => handleDeleteStudent(student.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    未找到匹配的学生。
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
