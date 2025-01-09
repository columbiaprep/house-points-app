"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@nextui-org/react';

const AuthPage = () => {
  const auth = useAuth();
  const router = useRouter();

  if (auth.user?.email) {
    router.push('/dashboard');
  }

  return (
    <>
        <div className="flex items-center justify-center h-screen bg-background">
        <Card style={{ minWidth: "400px", padding: "20px"}} className='bg-gray-800'>
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
            Auth Page
            </h1>
            <Button
            color="primary"
            onPress={auth.authWithGoogle}
            style={{ width: "100%", marginBottom: "20px" }}
            >
            Sign in with Google
            </Button>
        </Card>
        </div>

    </>
  );
};

export default AuthPage;