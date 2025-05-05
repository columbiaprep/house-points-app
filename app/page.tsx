"use client";

import { useRouter } from "next/navigation";

export default function Home() {
    //TODO: Combine this with Dashboard or remove it, since it's just 
    //moving us into /dashboard anyway
    const router = useRouter();

    router.push("/dashboard");

    return (
        <section>

        </section>
    );
}
