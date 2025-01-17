'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import AdminMassPointsForm from '@/components/Admin/AdminMassPointsForm';
import AdminPointsForm from '@/components/Admin/AdminPointsForm';
import AdminReset from '@/components/Admin/AdminReset';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const auth = useAuth();
  const router = useRouter();

  const accountType = auth.accountType;

  useEffect(() => {
    if (accountType == 'student' || accountType == 'teacher') {
      router.push('/dashboard');
    }
  }, [accountType]);

  return (
    <div>
      {auth.accountType == 'admin' && (
        <div className="container p-4">
          <h1 className="text-3xl font-bold text-center mb-6">
            Admin Dashboard
          </h1>
          <div className="flex flex-wrap justify-around gap-4 flex-row">
            <div className="w-5/12">
              <AdminPointsForm />
            </div>
            <div className="w-5/12">
              <AdminMassPointsForm />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">Yearly Reset</h2>
              <AdminReset />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
