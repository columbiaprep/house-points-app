"use client";

import { useRouter } from "next/navigation";

import { Shout } from "@/components/shout";
import { AchievementsContainer } from "@/components/achievements";
import { IndividualHouseSpreadComp } from "@/components/Individual-house-comp";

export default function Home() {
    const router = useRouter();

    router.push("/dashboard");

    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <Shout />

            <IndividualHouseSpreadComp />

        </section>
    );
}
