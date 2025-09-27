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
            try {
                if (user && user.email) {
                    if (user.photoURL) {
                        setPhotoURL(user.photoURL);
                    }
                    setUser(user);

                    // Add delay to ensure auth token is fully propagated to Firestore
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Retry mechanism for Firestore calls
                    const retryFirestoreCall = async (fn: () => Promise<any>, maxRetries = 3) => {
                        for (let i = 0; i < maxRetries; i++) {
                            try {
                                return await fn();
                            } catch (error: any) {
                                if (error?.code === 'permission-denied' && i < maxRetries - 1) {
                                    console.log(`Firestore permission denied, retrying... (${i + 1}/${maxRetries})`);
                                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                                    continue;
                                }
                                throw error;
                            }
                        }
                    };

                    const accountType = user.email
                        ? await retryFirestoreCall(() => getUserAccountType(user.email!))
                        : null;

                    setAccountType(accountType);

                    // Only fetch individual data for students, not admins
                    if (accountType === "student") {
                        const userData = await retryFirestoreCall(() => getDataDoc(user.email!));
                        setUserDbData(userData);
                    } else {
                        setUserDbData(null);
                    }

                    setLoading(false);
                } else {
                    setUser(null);
                    setAccountType(null);
                    setLoading(false);
                    router.push("/auth");
                }
            } catch (error) {
                console.error("AuthContext error:", error);
                // Set loading to false and continue with limited functionality
                setLoading(false);
                setAccountType(null);
                setUserDbData(null);
                // Don't redirect to auth if there's just a permissions error
                if (user) {
                    setUser(user);
                } else {
                    router.push("/auth");
                }
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
        try {
            return await fetchIndividual(email);
        } catch (error) {
            console.warn(`Individual record not found for ${email}:`, error);
            return null;
        }
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
                await signOutUser();
                alert("Please sign in with your CGPS email.");
                router.push("/auth");

                return;
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
