"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "./query.provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster theme="dark" position="bottom-right" richColors />
    </QueryProvider>
  );
}
