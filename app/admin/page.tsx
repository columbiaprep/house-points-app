"use client"
import AdminMassPointsForm from "@/components/Admin/AdminMassPointsForm";
import AdminPointsForm from "@/components/Admin/AdminPointsForm";
import AdminReset from "@/components/Admin/AdminReset";

export default function AdminPage() {
  return (
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
  );
}