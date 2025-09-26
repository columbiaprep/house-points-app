import Image from "next/image";
import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import { Link } from "@heroui/link";

import { useAuth } from "@/contexts/AuthContext";
import {
    fetchHouseSummariesWithFallback,
    HouseSummary,
    checkAggregatedCollectionsExist,
} from "@/firebase-configuration/optimizedFirebaseDb";

export const OptimizedHousePointsRow: React.FC<
    HouseSummary & { isStudentHouse?: boolean }
> = ({ name, place, colorName, accentColor, totalPoints, isStudentHouse }) => {
    const gradientClasses = `from-${colorName}-400 to-${accentColor}-700 outline-${accentColor}-900 shadow-${colorName}-500/50`;
    const outlineThickness = isStudentHouse ? "outline-8" : "hover:outline-4";
    const houseImage = name.split(" ")[0].toLowerCase();

    return (
        <Link
            className={`grid min-w-400 max-h-200 place-items-center ${gradientClasses} shadow-lg items-center flex rounded-xl bg-gradient-to-r mb-5 ${outlineThickness} `}
            color={"foreground"}
            href={`/spread/${houseImage}`}
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
                src={"/house-images/" + houseImage + ".png"}
                width={50}
                style={{ width: "auto", height: "auto" }}
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

export const OptimizedHousePointsContainer = () => {
    const [houses, setHouses] = useState<HouseSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [usingOptimized, setUsingOptimized] = useState<boolean | null>(null);

    const student = useAuth().userDbData;

    useEffect(() => {
        const loadHouseData = async () => {
            setLoading(true);

            try {
                // Check if aggregated collections exist
                const { houseSummaries } =
                    await checkAggregatedCollectionsExist();

                setUsingOptimized(houseSummaries);

                if (houseSummaries) {
                    console.log("📊 Using optimized house summaries");
                } else {
                    console.log("⚠️ Fallback: Using original house data");
                }

                const housesData = await fetchHouseSummariesWithFallback();

                setHouses(housesData);
            } catch (error) {
                console.error("Error loading house data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHouseData();
    }, []);

    return (
        <div className="w-full flex flex-col justify-center">
            {/* Debug info for admins */}
            {process.env.NODE_ENV === "development" &&
                usingOptimized !== null && (
                    <div className="mb-2 p-2 bg-gray-100 rounded text-xs text-center">
                        {usingOptimized
                            ? "🚀 Using optimized aggregated data"
                            : "⚠️ Using fallback (original) data"}
                    </div>
                )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner
                        classNames={{ label: "text-foreground mt-4" }}
                        label="wave"
                        variant="wave"
                    />
                </div>
            ) : (
                <div className="w-full max-w-2xl mx-auto">
                    {houses.map((house, index) => (
                        <OptimizedHousePointsRow
                            key={index}
                            accentColor={house.accentColor}
                            colorName={house.colorName}
                            isStudentHouse={house.name === student?.house}
                            lastUpdated={house.lastUpdated}
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
