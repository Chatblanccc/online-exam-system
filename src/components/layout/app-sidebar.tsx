"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Settings,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [openExams, setOpenExams] = useState(true);
  const [openStudents, setOpenStudents] = useState(true);

  // Auto-expand if on a sub-page
  useEffect(() => {
    if (pathname.includes("/dashboard/exams")) {
      setOpenExams(true);
    }
    if (pathname.includes("/dashboard/students") || pathname.includes("/dashboard/classes")) {
      setOpenStudents(true);
    }
  }, [pathname]);

  const routes = [
    {
      label: "总览",
      icon: LayoutDashboard,
      href: "/dashboard/overview",
      active: pathname === "/dashboard/overview",
    },
    {
      label: "考试管理",
      icon: FileText,
      href: "/dashboard/exams",
      active: pathname.includes("/dashboard/exams"),
      isCollapsible: true,
      isOpen: openExams,
      onToggle: () => setOpenExams(!openExams),
      children: [
        {
          label: "所有考试",
          href: "/dashboard/exams",
          active: pathname === "/dashboard/exams",
        },
        {
          label: "创建考试",
          href: "/dashboard/exams/create",
          active: pathname === "/dashboard/exams/create",
        },
      ],
    },
    {
      label: "学生管理",
      icon: GraduationCap,
      href: "/dashboard/students",
      active: pathname.includes("/dashboard/students") || pathname.includes("/dashboard/classes"),
      isCollapsible: true,
      isOpen: openStudents,
      onToggle: () => setOpenStudents(!openStudents),
      children: [
        {
          label: "学生列表",
          href: "/dashboard/students",
          active: pathname === "/dashboard/students",
        },
        {
          label: "班级管理",
          href: "/dashboard/classes",
          active: pathname === "/dashboard/classes",
        },
      ],
    },
    {
      label: "设置",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-sidebar", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-2 px-4 flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">E</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              ExamSystem
            </h2>
          </div>
          <div className="space-y-1">
            {routes.map((route) => (
              <div key={route.label} className="space-y-1">
                {route.children ? (
                  <Button
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      route.active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:text-sidebar-foreground"
                    )}
                    onClick={(e) => {
                       if (route.onToggle) {
                         e.preventDefault();
                         route.onToggle();
                       }
                    }}
                  >
                     <route.icon className="mr-2 h-4 w-4" />
                     <span className="flex-1 text-left">{route.label}</span>
                     {route.isOpen ? (
                        <ChevronDown className="h-4 w-4 ml-2" />
                     ) : (
                        <ChevronRight className="h-4 w-4 ml-2" />
                     )}
                  </Button>
                ) : (
                  <Button
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      route.active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:text-sidebar-foreground",
                      route.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    asChild={!route.disabled}
                    disabled={route.disabled}
                  >
                    {route.disabled ? (
                      <span className="flex items-center">
                        <route.icon className="mr-2 h-4 w-4" />
                        {route.label}
                      </span>
                    ) : (
                      <Link href={route.href}>
                        <route.icon className="mr-2 h-4 w-4" />
                        {route.label}
                      </Link>
                    )}
                  </Button>
                )}

                {route.children && route.isOpen && (
                  <div className="ml-4 space-y-1 border-l border-sidebar-border pl-2">
                    {route.children.map((child) => (
                      <Button
                        key={child.href}
                        variant={child.active ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start h-8 font-normal",
                          child.active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:text-sidebar-foreground"
                        )}
                        asChild
                      >
                        <Link href={child.href}>
                          {child.label}
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
