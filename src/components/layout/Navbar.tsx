"use client";

import Image from "next/image";
import { ViewToggle } from "@/components/ui/ViewToggle";

export function Navbar() {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Image
              src="https://planopticon.energy/logo.svg"
              alt="Planopticon"
              width={48}
              height={24}
              className="h-6 w-12"
              priority
            />
            <h1 className="text-xl font-semibold text-foreground ml-3">
              GB-EU Interconnector Dashboard
            </h1>
          </div>
          
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <ViewToggle />
          </div>
          
          <div className="w-0"></div> {/* Spacer for flex layout */}
        </div>
      </div>
    </nav>
  );
}
