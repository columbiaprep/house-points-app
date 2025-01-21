"use client";

import { useState } from "react";
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import { useAuth } from '@/contexts/AuthContext';
import { fetchIndividual, IndividualDocument } from "@/firebase-configuration/firebaseDb";


export const StudentIndividualPoints = async () => {
  const user = useAuth().user

  if (!user || !user.email) {
    throw new Error('User email is not available');
  }  
  const userDoc = await fetchIndividual(user.email)
  const totalPoints = userDoc.beingGoodPts + userDoc.attendingEventsPts + userDoc.sportsTeamPts;
  //TODO: Change how totalpoints is calculated once
  //backend is updated to have a totalpoints field
      
      return (
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3">
            <h1>Your Points</h1>

          </CardHeader>
          <Divider />

          <CardFooter className="flex flex-col items-center">
            <h3>{totalPoints}</h3>
          </CardFooter>
        </Card>
      );
  }
