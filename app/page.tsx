"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    //TODO: Combine this with Dashboard or remove it, since it's just
    //moving us into /dashboard anyway
    const router = useRouter();

    useEffect(() => {
        router.push("/dashboard");
    }, []);

    return <section />;
}
