"use client";

import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
// Simple Breadcrumb fallback if component doesn't exist
const SimpleBreadcrumb = ({ path }: { path: string }) => {
  const segments = path.split("/").filter(Boolean);
  
  const labelMap: Record<string, string> = {
    dashboard: "工作台",
    overview: "总览",
    exams: "考试管理",
    create: "创建考试",
    students: "学生管理",
    classes: "班级管理",
    settings: "设置",
    submissions: "提交记录",
    exam: "考试",
    take: "答题",
    analysis: "数据分析",
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {segments.map((segment, index) => {
        // Skip IDs (check if segment is cuid/uuid like)
        if (segment.length > 20) return null;

        const isLast = index === segments.length - 1;
        const label = labelMap[segment] || segment;
        
        return (
          <div key={segment} className="flex items-center">
            {index > 0 && <span className="mx-2 text-muted-foreground/50">/</span>}
            <span className={isLast ? "font-medium text-foreground capitalize" : "capitalize"}>
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
};

export function AppHeader({ user }: { user?: { name?: string | null } }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <SimpleBreadcrumb path={pathname} />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="mr-2">欢迎,</span>
          <span className="font-medium text-foreground">{user?.name}</span>
        </div>
        <div className="h-4 w-[1px] bg-border" /> {/* Separator */}
        <SignOutButton />
      </div>
    </header>
  );
}
