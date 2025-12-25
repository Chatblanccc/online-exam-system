"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ClassActionsProps {
  classItem: {
    id: string;
    name: string;
    status: "ACTIVE" | "DISABLED";
  };
  onStatusChange: (newStatus: "ACTIVE" | "DISABLED") => void;
  onDelete: () => void;
}

export function ClassActions({ classItem, onStatusChange, onDelete }: ClassActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"ACTIVE" | "DISABLED" | null>(null);

  const handleStatusClick = (status: "ACTIVE" | "DISABLED") => {
    setPendingStatus(status);
    setIsStatusOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">打开菜单</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {classItem.status === "ACTIVE" ? (
            <DropdownMenuItem 
              onClick={() => handleStatusClick("DISABLED")} 
              className="cursor-pointer text-amber-600 focus:text-amber-600"
            >
              <ShieldX className="mr-2 h-4 w-4" />
              禁用班级
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => handleStatusClick("ACTIVE")} 
              className="cursor-pointer text-green-600 focus:text-green-600"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              启用班级
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)} 
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除班级
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Change Confirmation */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === "DISABLED" ? "确认禁用该班级？" : "确认启用该班级？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "DISABLED" 
                ? "禁用后，该班级的学生将无法进行登录和考试。已登录的学生在下次操作时将被拦截。" 
                : "启用后，该班级的学生将恢复正常使用系统的权限。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingStatus && onStatusChange(pendingStatus)}
              className={pendingStatus === "DISABLED" ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}
            >
              确认{pendingStatus === "DISABLED" ? "禁用" : "启用"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除该班级吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。只有在班级内没有任何学生时才能删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

