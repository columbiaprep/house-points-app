"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import axios from 'axios'

export const StudentIndividualPoints = () => {
      //get the data from the API
      //store it locally

      //render the student points component
      //insert the points value for that
      //student into the component
      //const [housePoints, setHousePoints] = useState(100);
      
      return (
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3">
            <h1>Your Points</h1>

          </CardHeader>
          <Divider />

          <CardFooter className="flex flex-col items-center">
            {/* <p className="text-xl font-bold">{housePoints}</p> */}
            <h3>100</h3>
          </CardFooter>
        </Card>
      );
  }
