"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AdminMassPointsForm from "@/components/Admin/AdminMassPointsForm";
import AdminPointsForm from "@/components/Admin/AdminPointsForm";
import AdminReset from "@/components/Admin/AdminReset";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
    const auth = useAuth();
    const router = useRouter();

    const accountType = auth.accountType;

    useEffect(() => {
        if (accountType == "student" || accountType == "teacher") {
            router.push("/dashboard");
        }
    }, [accountType]);

    return (
        <div className="grid w-full">
            {auth.accountType == "admin" && (
                <div className="container justify-self-center w-full p-4">
                    <h1 className="text-3xl font-bold text-center mb-6">
                        Admin Dashboard
                    </h1>
                    <div className="flex w-full flex-wrap justify-around flex-col md:flex-row">
                        <div className="md:w-5/12 ">
                            <AdminPointsForm />
                        </div>
                        <div className="md:w-5/12">
                            <AdminMassPointsForm />
                            <AdminReset />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
