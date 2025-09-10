"use client";

import { Button } from "@/components/ui/button";
import { BarChart3, BookOpen } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex items-center gap-2 bg-card rounded-lg p-1">
      <Button
        variant={isActive("/charts") ? "default" : "ghost"}
        size="sm"
        onClick={() => router.push("/charts")}
        className="flex items-center gap-2"
      >
        <BarChart3 className="h-4 w-4" />
        Chart View
      </Button>
      <Button
        variant={isActive("/story") ? "default" : "ghost"}
        size="sm"
        onClick={() => router.push("/story")}
        className="flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" />
        Story View
      </Button>
    </div>
  );
}
