"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import AdminReset from "@/components/Admin/AdminReset";
import { useAuth } from "@/contexts/AuthContext";
import AddAdmins from "@/components/Admin/AddAdmins";
import { AggregatedDataManager } from "@/components/Admin/AggregatedDataManager";
import AdminStudentManager from "@/components/Admin/AdminStudentManager";
import HouseBonusPointsManager from "@/components/Admin/HouseBonusPointsManager";
import UnifiedHistoryViewer from "@/components/Admin/UnifiedHistoryViewer";
import BatchRollbackManager from "@/components/Admin/BatchRollbackManager";
import HouseTotalsFixer from "@/components/Admin/HouseTotalsFixer";

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

                    {/* Primary Management Section - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div>
                            <AdminStudentManager />
                        </div>
                        <div>
                            <HouseBonusPointsManager />
                        </div>
                    </div>

                    {/* Unified History Viewer Section */}
                    <div className="w-full mb-8">
                        <UnifiedHistoryViewer />
                    </div>

                    {/* Batch Rollback Manager Section */}
                    <div className="w-full mb-8">
                        <BatchRollbackManager />
                    </div>

                    {/* House Totals Fixer Section */}
                    <div className="w-full mb-8">
                        <HouseTotalsFixer />
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
