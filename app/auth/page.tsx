"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";

import { useAuth } from "@/contexts/AuthContext";

const AuthPage = () => {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (auth.user?.email) {
            router.push("/dashboard");
        }
    }, [auth.user?.email, router]);

    return (
        <>
            <div className="flex items-center justify-center h-screen bg-background">
                <Card
                    className="bg-foreground"
                    style={{ minWidth: "400px", padding: "20px" }}
                >
                    <h1
                        className="text-background"
                        style={{ textAlign: "center", marginBottom: "20px" }}
                    >
                        Auth Page
                    </h1>
                    <Button
                        color="secondary"
                        style={{ width: "100%", marginBottom: "20px" }}
                        onPress={auth.authWithGoogle}
                    >
                        Sign in with Google
                    </Button>
                </Card>
            </div>
        </>
    );
};

export default AuthPage;
