"use client"
import AdminMassPointsForm from "@/components/Admin/AdminMassPointsForm";
import AdminPointsForm from "@/components/Admin/AdminPointsForm";
import AdminReset from "@/components/Admin/AdminReset";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const auth = useAuth();
  const router = useRouter();
  auth.setLoading(true)
  if (!auth.user || auth.accountType !== "admin") {
    auth.setLoading(false)
    router.push("/dashboard");
  }
  return (
    <>
    { auth.accountType === "admin" &&
      <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>
          <h2 className="text-2xl font-bold mb-6">Points Management</h2>
          <div>
              <AdminPointsForm />
          </div>
          <h2 className="text-2xl font-bold mb-6">Mass Student Points Management</h2>
          <div>
              <AdminMassPointsForm />
          </div>
          <h2 className="text-2xl font-bold mb-6">Yearly Reset</h2>
          <div>
              <AdminReset />
          </div>
      </div>
  }
    </>
  );
}