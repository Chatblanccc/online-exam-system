import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExamActions } from "./exam-actions";

export default async function ExamsPage() {
  await requireAdmin();

  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { submissions: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">考试管理</h1>
        <Link href="/dashboard/exams/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> 创建考试
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>所有考试</CardTitle>
          <CardDescription>
            查看及管理所有考试及其提交记录。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>时长</TableHead>
                <TableHead>总分</TableHead>
                <TableHead>提交人数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.duration} 分钟</TableCell>
                  <TableCell>{exam.totalScore}</TableCell>
                  <TableCell>{exam._count.submissions}</TableCell>
                  <TableCell className="text-right">
                    <ExamActions examId={exam.id} />
                  </TableCell>
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    暂无数据
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
