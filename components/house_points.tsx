import { fetchAllHouses, HouseDocument } from "@/firebase-configuration/firebaseDb";
import { Card, Divider } from "@nextui-org/react";
import { useEffect, useState } from "react";

const HousePoints =  () => {
    const [houses, setHouses] = useState<HouseDocument[]>([]);

    useEffect(() => {
       const fetchHouseData = async () => {
        var data = await fetchAllHouses()
        setHouses(data);
       } 
       fetchHouseData();
    }, [])

    return (
        <>
            <Card className="p-6 h-auto">
               Leaderboard
               <Divider />
              {
                houses.map((house: HouseDocument) => (
                    <div className="flex flex-row justify-between">
                        <p>{house.name}</p>
                        <p>{house.totalPoints}</p>
                    </div>
                ))
              }
            </Card>
        </>
    )
}


export default HousePoints;