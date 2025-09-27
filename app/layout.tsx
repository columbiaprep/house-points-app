import "@/styles/globals.css";
import { Metadata } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans, fontMono } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/contexts/QueryProvider";

export const metadata: Metadata = {
    title: {
        default: "CGPS Houses",
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: "/cgps-houses-mini-logo.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
            </head>
            <body
                className={clsx(
                    "min-h-screen w-full font-sans antialiased",
                    fontSans.variable,
                    fontMono.variable,
                )}
            >
                <AuthProvider>
                    <QueryProvider>
                        <Providers themeProps={{ attribute: "class" }}>
                            <div className="relative w-full flex flex-col h-screen">
                                <Navbar />
                                <main className="bg-background text-foreground container pt-16 px-6 flex-grow max-w-full">
                                    {children}
                                </main>
                            </div>
                        </Providers>
                    </QueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
