'use client';
import { Snippet } from '@nextui-org/snippet';
import { Code } from '@nextui-org/code';

import { Shout } from '@/components/shout';
import { AchievementsContainer } from '@/components/achievements';

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Shout />

      <AchievementsContainer />

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
