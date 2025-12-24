"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-primary"
      onClick={() => {
        void signOut({ callbackUrl: "/login" });
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      退出登录
    </Button>
  );
}
