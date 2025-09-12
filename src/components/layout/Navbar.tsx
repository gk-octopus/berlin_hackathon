"use client";

import Image from "next/image";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
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
               The UK Energy Divide

            </h1>
          </div>
          
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <ViewToggle />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setIsDisclaimerOpen(true)}
            >
              Disclaimer
            </Button>
          </div>
        </div>
      </div>
      {isDisclaimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsDisclaimerOpen(false)}
          />
          <div className="relative z-10 w-[92%] max-w-lg bg-card border border-border rounded-lg shadow-xl">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-2">Disclaimer</h2>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  This demo was created during a ~30-hour hackathon for illustrative and
                  entertainment purposes. Octopus Energy and contributors accept no
                  liability for any use of, or reliance on, this demo.
                </p>
                <p>
                  Data visualisations may be incomplete, inaccurate, or outdated. While
                  some inputs are sourced from official or public datasets (e.g. NESO),
                  they may be transformed, simplified, or interpreted and therefore may
                  contain errors.
                </p>
                <p>
                  No warranty (express or implied) is given as to fitness for any
                  purpose. Nothing herein constitutes advice. Use at your own risk.
                </p>
                <p>
                  To the maximum extent permitted by applicable law, this demo is
                  provided "as is" and "as available" without warranties of any kind.
                  No party involved in its creation, publication or delivery (including
                  Octopus Energy and contributors) accepts any responsibility or
                  liability for any use of, or reliance on, it, or for any loss or
                  damage of any kind arising therefrom.
                </p>
                <p>
                  This codebase was produced rapidly to publish a clickable demo within
                  hackathon time constraints. It may contain errors, shortcuts, and
                  ESLint bypasses and is not production-ready.
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDisclaimerOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
