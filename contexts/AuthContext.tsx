"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
} from "@firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/firebase-configuration/firebaseApp";
import {
    getUserAccountType,
    checkIfUserExists,
    addToDb,
    fetchIndividual,
    IndividualDocument,
} from "@/firebase-configuration/firebaseDb";

interface AuthContextType {
    user: User | null;
    accountType: string | null;
    loading: boolean;
    photoURL: string;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    userDbData: IndividualDocument | null;
    signOutUser: () => Promise<void>;
    authWithGoogle: () => Promise<void>;
    theme: string;
    changeTheme: (theme: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [accountType, setAccountType] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string>("");
    const [theme, setTheme] = useState<string>("light");
    const [userDbData, setUserDbData] = useState<IndividualDocument | null>(
        null,
    );
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email) {
                if (user.photoURL) {
                    setPhotoURL(user.photoURL);
                }
                setUser(user);
                const accountType = user.email
                    ? await getUserAccountType(user.email)
                    : null;

                setAccountType(accountType);
                setUserDbData(await getDataDoc(user.email));
                setLoading(false);
            } else {
                setUser(null);
                setAccountType(null);
                setLoading(false);
                router.push("/auth");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const signOutUser = async () => {
        setLoading(true);
        await signOut(auth);
        setUser(null);
        setAccountType(null);
        setPhotoURL("");
        setLoading(false);
        router.push("/auth");
    };

    const getDataDoc = async (email: string) => {
        return await fetchIndividual(email);
    };

    const authWithGoogle = async () => {
        setLoading(true);

        const provider = new GoogleAuthProvider();

        await signInWithPopup(auth, provider).catch((error) => {
            if (error.code === "auth/popup-closed-by-user") {
                router.push("/auth");
            }
        });
        const user = auth.currentUser;

        if (user) {
            if (!user.email?.includes("@cgps.org")) {
                alert("Please sign in with your CGPS email");
                await signOutUser();
                router.push("/auth");
            }
            const exists = user.email
                ? await checkIfUserExists(user.email)
                : false;

            if (!exists) {
                if (user.email) {
                    await addToDb(
                        user.email,
                        user.uid,
                        user.displayName || "",
                        user.photoURL || "",
                    );
                }
            }
        }
        setUser(user);
        router.push("/dashboard");
        setLoading(false);
    };
    // Change the theme of the app
    const changeTheme = (theme: string) => {
        setTheme(theme);
        const main = document.querySelector("main");

        main?.classList.remove("dark", "light");
        main?.classList.add(theme);
    };

    useEffect(() => {
        changeTheme(theme);
    }, [theme]);

    return (
        <AuthContext.Provider
            value={{
                user,
                accountType,
                loading,
                photoURL,
                setLoading,
                signOutUser,
                authWithGoogle,
                theme,
                changeTheme,
                userDbData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};
