"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/system";
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
        <HeroUIProvider navigate={router.push}>
            <NextThemesProvider {...themeProps}>
                {children}
                {loading && <Loading />}
            </NextThemesProvider>
        </HeroUIProvider>
    );
}
