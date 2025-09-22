"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AdminReset from "@/components/Admin/AdminReset";
import { useAuth } from "@/contexts/AuthContext";
import AddAdmins from "@/components/Admin/AddAdmins";
import { AggregatedDataManager } from "@/components/Admin/AggregatedDataManager";
import AdminStudentManager from "@/components/Admin/AdminStudentManager";
import HouseBonusPointsManager from "@/components/Admin/HouseBonusPointsManager";
import StudentCsvDownloader from "@/components/Admin/StudentCsvDownloader";
import AuthDebugTester from "@/components/Admin/AuthDebugTester";

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
                <div className="container justify-self-center w-full max-w-6xl p-4">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Admin Dashboard
                    </h1>

                    {/* Primary Student Management Section */}
                    <div className="w-full mb-8">
                        <AdminStudentManager />
                    </div>

                    {/* House Bonus Points Management Section */}
                    <div className="w-full mb-8">
                        <HouseBonusPointsManager />
                    </div>

                    {/* Student Data Export Section */}
                    <div className="w-full mb-8">
                        <StudentCsvDownloader />
                    </div>

                    {/* Authentication Debug Tester */}
                    <div className="w-full mb-8">
                        <AuthDebugTester />
                    </div>

                    {/* Secondary Admin Tools - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* User Management */}
                        <div>
                            <AddAdmins />
                        </div>

                        {/* Data Management */}
                        <div>
                            <AggregatedDataManager />
                        </div>
                    </div>

                    {/* Database Reset - Full Width Warning Section */}
                    <div className="w-full">
                        <AdminReset />
                    </div>
                </div>
            )}
        </div>
    );
}
