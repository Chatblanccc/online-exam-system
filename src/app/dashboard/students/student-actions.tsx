"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldX, RotateCcw, Trash2, UserCheck, UserX } from "lucide-react";
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

interface StudentActionsProps {
  student: {
    id: string;
    status: "PENDING" | "ACTIVE" | "REJECTED";
  };
  onStatusChange: (newStatus: "ACTIVE" | "REJECTED") => void;
  onResetPassword: () => void;
  onDelete: () => void;
}

export function StudentActions({ student, onStatusChange, onResetPassword, onDelete }: StudentActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

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
          {student.status === "PENDING" && (
            <>
              <DropdownMenuItem onClick={() => onStatusChange("ACTIVE")} className="cursor-pointer text-green-600">
                <UserCheck className="mr-2 h-4 w-4" />
                审核通过
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("REJECTED")} className="cursor-pointer text-red-600">
                <UserX className="mr-2 h-4 w-4" />
                审核拒绝
              </DropdownMenuItem>
            </>
          )}
          {student.status === "ACTIVE" && (
            <DropdownMenuItem onClick={() => onStatusChange("REJECTED")} className="cursor-pointer text-red-600">
              <ShieldX className="mr-2 h-4 w-4" />
              禁用账户
            </DropdownMenuItem>
          )}
          {student.status === "REJECTED" && (
            <DropdownMenuItem onClick={() => onStatusChange("ACTIVE")} className="cursor-pointer text-green-600">
              <ShieldCheck className="mr-2 h-4 w-4" />
              重新激活
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)} className="cursor-pointer">
            <RotateCcw className="mr-2 h-4 w-4" />
            重置密码
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)} 
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除学生
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除该学生吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除该学生及其所有的考试记录和答题数据。
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

      {/* Reset Password Confirmation */}
      <AlertDialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重置学生密码？</AlertDialogTitle>
            <AlertDialogDescription>
              该学生的密码将被重置为默认密码：<span className="font-bold text-foreground">Ab123456</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onResetPassword}>
              确认重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

