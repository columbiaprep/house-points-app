"use client"
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { AchievementsContainer } from "@/components/achievements"
import { StudentIndividualPoints } from "@/components/student";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">

      <AchievementsContainer />
      <StudentIndividualPoints />
      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
        </Snippet>
      </div>
    </section>
  );
}
