"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthPage = () => {
    const auth = useAuth();
    const router = useRouter();
    if (auth.user?.email) {
        router.push('/dashboard')
    }
    useEffect(() => {
        auth.authWithGoogle();
    }, []);
};

export default AuthPage;