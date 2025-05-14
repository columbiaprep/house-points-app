import Image from "next/image";
import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";

import { fetchAllHouses } from "@/firebase-configuration/firebaseDb";
import { HouseDocument } from "@/firebase-configuration/firebaseDb";

export const HousePointsRow: React.FC<HouseDocument> = ({
    id,
    name,
    colorName,
    accentColor,
    houseImage,
    totalPoints,
}) => {
    const houseImageDefaultSrc = "./placeholder.svg";
    const gradientClasses = `from-${colorName}-400 to-${accentColor}-700 outline-${accentColor}-900 shadow-${colorName}-500/50`;

    console.log(gradientClasses);

    return (
        <div className="grid place-items-center min-w-screen">
            <div
                className={`${gradientClasses}  shadow-lg items-center flex flex-row h-14 w-full rounded-xl bg-gradient-to-r hover:outline outline-4`}
            >
                {/* Div above will be a button later to take you to the houses page */}

                {/* Also the distance between House name and Points would change once I could get it to be smaller then the whole page */}
                <Image
                    priority
                    alt={name}
                    className="ms-2 me-2 object-center object-contain dark:invert flex-initial"
                    height={50}
                    src={houseImageDefaultSrc}
                    width={50}
                />

                <p
                    className={`text-xl align-middle basis-3/5 font-stretch-150% font-mono font-bold flex-1 basis-16`}
                >
                    {name}
                </p>

                <p className="me-2 text-xl basis-2/5 font-stretch-100% font-mono font-medium flex-1 basis-16">
                    Points: {totalPoints}
                </p>
            </div>
            <div className="h-2">{/* Spacing between different houses */}</div>
        </div>
    );
};

export const HousePointsContainer = () => {
    //anything I'm fetching needs to use the below format
    //import the appropriate interface from the database
    const [houses, setHouses] = useState<HouseDocument[]>([]);

    //this keeps track of the loading state of the component
    const [loading, setLoading] = useState(false);

    //useEffect gets called immediately, before the rest of the component loads
    //it calls the function to get the house document info, then passes it
    //to the stateful variable "houses" above
    useEffect(() => {
        setLoading(true);
        fetchAllHouses()
            .then((h) => {
                setHouses(h);
            })
            .then(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-slate-800 grid place-items-center min-h-screen min-w-screen">
            {" "}
            {/* Any settings on the container should be added to the div to the left (like border, etc.) */}
            {loading ? (

                <Spinner
                    classNames={{ label: "text-foreground mt-4" }}
                    label="wave"
                    variant="wave"
                />
            ) : (
                <div className="">
                    {houses.map((house, index) => (
                        <HousePointsRow
                            key={index}
                            accentColor={house.accentColor}
                            colorName={house.colorName}
                            houseImage={house.houseImage}
                            id={house.name}
                            name={house.name}
                            totalPoints={house.totalPoints}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
