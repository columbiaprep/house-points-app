"use client";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { useRouter } from "next/navigation";

import { Shout } from "@/components/shout";
import { AchievementsContainer } from "@/components/achievements";

export default function Home() {
    const router = useRouter();

    router.push("/dashboard");

    return (
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
            <Shout />

            <AchievementsContainer />

            <div className="mt-8">
                <Snippet hideCopyButton hideSymbol variant="bordered">
                    <span>
                        Get started by editing{" "}
                        <Code color="primary">app/page.tsx</Code>
                    </span>
                </Snippet>
            </div>
        </section>
    );
}
