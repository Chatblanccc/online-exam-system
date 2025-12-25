"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { 
  Search, 
  Users, 
  Trophy, 
  Target, 
  AlertCircle,
  Loader2,
  ChevronRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExamInfo {
  id: string;
  title: string;
  createdAt: Date;
}

interface AnalysisData {
  exam: {
    id: string;
    title: string;
    totalScore: number;
  };
  stats: {
    total: number;
    average: number;
    max: number;
    min: number;
    passRate: number;
  };
  scoreDistribution: { range: string; count: number }[];
  classPerformance: { name: string; average: number; rate: number }[];
  questionAnalysis: {
    id: string;
    order: number;
    type: string;
    points: number;
    correctRate: number;
    averageScore: number;
  }[];
}

export function AnalysisClient({ initialExams }: { initialExams: ExamInfo[] }) {
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchData(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analysis/exams/${id}`);
      if (!res.ok) throw new Error("获取数据失败");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <Card className="border-[var(--shell-border)] bg-[var(--shell-surface)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">选择考试</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="请选择需要分析的考试" />
            </SelectTrigger>
            <SelectContent>
              {initialExams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">参加人数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均分</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.average}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">及格率</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.passRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最高分</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.max}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最低分</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.min}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Distribution Chart */}
            <Card className="border-[var(--shell-border)] bg-[var(--shell-surface)]">
              <CardHeader>
                <CardTitle>成绩分布</CardTitle>
                <CardDescription>各分数段人数分布情况</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="range" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip 
                      cursor={{ fill: "hsl(var(--muted)/0.1)" }}
                      contentStyle={{ 
                        backgroundColor: "#ffffff", 
                        borderRadius: "8px", 
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                      }} 
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Class Performance Chart */}
            <Card className="border-[var(--shell-border)] bg-[var(--shell-surface)]">
              <CardHeader>
                <CardTitle>班级表现对比</CardTitle>
                <CardDescription>各班级平均得分率 (%)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pl-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.classPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number"
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      width={80}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip 
                      cursor={{ fill: "hsl(var(--muted)/0.1)" }}
                      contentStyle={{ 
                        backgroundColor: "#ffffff", 
                        borderRadius: "8px", 
                        border: "1px solid #e2e8f0"
                      }}
                    />
                    <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Question Analysis Table */}
          <Card className="border-[var(--shell-border)] bg-[var(--shell-surface)]">
            <CardHeader>
              <CardTitle>题目得分分析</CardTitle>
              <CardDescription>详细分析每道题目的正确率和平均分，帮助定位知识盲点。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">题号</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>分值</TableHead>
                    <TableHead>平均分</TableHead>
                    <TableHead className="text-right">正确率/得分率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.questionAnalysis.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">第 {q.order} 题</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {q.type === "SINGLE_CHOICE" ? "单选题" :
                           q.type === "MULTIPLE_CHOICE" ? "多选题" :
                           q.type === "TRUE_FALSE" ? "判断题" : "操作题"}
                        </Badge>
                      </TableCell>
                      <TableCell>{q.points} 分</TableCell>
                      <TableCell>{q.averageScore}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${q.correctRate < 60 ? 'bg-destructive' : 'bg-primary'}`}
                              style={{ width: `${q.correctRate}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${q.correctRate < 60 ? 'text-destructive' : ''}`}>
                            {q.correctRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">暂未选择考试</CardTitle>
          <CardDescription>请从上方下拉框中选择一场考试以开始数据分析。</CardDescription>
        </Card>
      )}
    </div>
  );
}

