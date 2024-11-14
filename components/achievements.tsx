"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";

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
        <CardBody>
          
        </CardBody>
        <Divider/>
      </Card>
    );
  }