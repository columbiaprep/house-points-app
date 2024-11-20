"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import {Card, CardHeader, CardBody, CardFooter, Divider, Tooltip, Image} from "@nextui-org/react";

interface TrophyIconProps {
  achievementName: string,
  achievementIconSrc: string
}

const dummyAchievementData = [
  {
    achievementName: "Top Points Earner",
    achievementIconSrc: "https://placehold.co/25x25"
  },
  {
    achievementName: "Fastest Climb",
    achievementIconSrc: "https://placehold.co/25x25"
  },
  {
    achievementName: "Top Points Earner",
    achievementIconSrc: "https://placehold.co/25x25"
  },
  {
    achievementName: "Fastest Climb",
    achievementIconSrc: "https://placehold.co/25x25"
  },
  {
    achievementName: "Top Points Earner",
    achievementIconSrc: "https://placehold.co/25x25"
  },
  {
    achievementName: "Fastest Climb",
    achievementIconSrc: "https://placehold.co/25x25"
  },
  {
    achievementName: "Top Points Earner",
    achievementIconSrc: "https://placehold.co/25x25"
  },
  {
    achievementName: "Fastest Climb",
    achievementIconSrc: "https://placehold.co/25x25"
  }
]

export const AchievementTrophyIcon: React.FC<TrophyIconProps> = ({achievementName, achievementIconSrc}) => {
  return (
   
      <Tooltip showArrow={true} content={achievementName} >
        <Image 
          width={50}
          height={50}
          src={achievementIconSrc}
          alt={achievementName}
          />
        </Tooltip>
   
  )
}

export const AchievementsContainer = () => {
    return (
      <Card className="max-w-[400px]">
        <CardHeader className="flex gap-3">
          <h1>Achievements</h1>
          <Image
            alt="trophy"
            height={25}
            radius="sm"
            src="https://placehold.co/25x25"
            width={25}
          />
        </CardHeader>
        <Divider/>
        <CardBody className="gap-2 grid grid-cols-4">
          
          {dummyAchievementData.map((item, index) => (
            <AchievementTrophyIcon key={index} achievementName={item.achievementName} achievementIconSrc={item.achievementIconSrc} />
          )
          )}
          
        </CardBody>
        <Divider/>
      </Card>
    );
  }
