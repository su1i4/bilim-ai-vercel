"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useAppStore } from "@/store/use-app-store";

export function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }),
  );
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
