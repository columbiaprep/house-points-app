import Image from "next/image";
import { Spinner } from "@heroui/react";
import { Link } from "@heroui/link";

import { useAuth } from "@/contexts/AuthContext";
import { HouseDocument } from "@/firebase-configuration/firebaseDb";
import { useHouseSummaries } from "@/hooks/useFirebaseData";

export const HousePointsRow: React.FC<HouseDocument> = ({
    id,
    place,
    name,
    colorName,
    accentColor,
    houseImage,
    totalPoints,
    isStudentHouse,
}) => {
    const gradientClasses = `from-${colorName}-400 to-${accentColor}-700 outline-${accentColor}-900 shadow-${colorName}-500/50`;
    const outlineThickness = isStudentHouse ? "outline-8" : "hover:outline-4";

    return (
        <Link
            className={`grid min-w-400 max-h-200 place-items-center ${gradientClasses} shadow-lg items-center flex rounded-xl bg-gradient-to-r mb-5 ${outlineThickness} `}
            color={"foreground"}
            href={`/spread/${houseImage.toLowerCase()}`}
            isBlock={true}
            underline={"none"}
        >
            <div className="ml-3 text-xl align-middle basis-1/10 font-stretch-100% font-mono font-bold">
                {place}
            </div>
            <Image
                priority
                alt={name}
                className="ms-2 me-2 object-center object-contain basis-2/10"
                height={50}
                src={"/houseImages/" + houseImage + ".png"}
                width={50}
            />

            <p
                className={`ml-1 text-wrap text-center text-2xl align-middle basis-5/10 flex-grow font-stretch-100% font-mono font-bold flex-1 overflow-hidden text-ellipsis`}
            >
                {name}
            </p>

            <p className="min-w-0 ml-1 me-2 text-xs basis-2/10 font-mono flex-shrink">
                Points:
                <br />
                <span className="text-xl font-bold">{totalPoints}</span>
            </p>
        </Link>
    );
};

export const HousePointsContainer = () => {
    const student = useAuth().userDbData;
    const { data: houses, isLoading: loading, error } = useHouseSummaries();

    if (error) {
        console.error("Error loading house summaries:", error);

        return (
            <div className="text-center text-red-500">
                Error loading house data
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner
                        classNames={{ label: "text-foreground mt-4" }}
                        label="wave"
                        variant="wave"
                    />
                </div>
            ) : (
                <div className="w-full max-w-2xl">
                    {houses?.map((house, index) => (
                        <HousePointsRow
                            key={index}
                            accentColor={house.accentColor}
                            colorName={house.colorName}
                            houseImage={house.name.split(" ")[0]}
                            id={house.name}
                            isStudentHouse={house.name == student?.house}
                            name={house.name}
                            place={house.place}
                            totalPoints={house.totalPoints}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
