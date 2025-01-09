"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/Loading";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const loading = useAuth().loading;

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        {children}
        {loading && (
          <Loading />
        )}
        </NextThemesProvider>
    </NextUIProvider>
  );
}
