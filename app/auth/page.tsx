"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
    const auth = useAuth();
    const router = useRouter();
    if (auth.user?.email) {
        router.push('/dashboard')
    }
    return (
        <div className="flex justify-center flex-col items-center min-h-screen bg-gray-100">
            <div style={{ padding: "10px"}}>
                <Button color="primary"  onPress={() => auth.authWithGoogle()}>
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
};

export default AuthPage;