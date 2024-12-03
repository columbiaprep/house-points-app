"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Divider, Image, Button } from "@nextui-org/react";

export const SPC = () => {
  const [housePoints, setHousePoints] = useState(100);

  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3">
      </CardHeader>
      <Divider />
      <CardBody className="gap-2 grid grid-cols-2 sm:grid-cols-4">
        <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="flex flex-col items-center">
        <h2>House Points</h2>
        <p className="text-xl font-bold">{housePoints}</p>
        <Button
          onClick={() => setHousePoints(housePoints + 10)}
          color="primary"
        >
          Add 10 Points
        </Button>
      </CardFooter>
    </Card>
  );
}
