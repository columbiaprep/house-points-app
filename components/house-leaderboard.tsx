import Image from "next/image";
import { Spinner } from "@heroui/react";
import { Link } from "@heroui/link";

import { useAuth } from "@/contexts/AuthContext";
import { HouseDocument } from "@/firebase-configuration/firebaseDb";
import { useHouseSummaries } from "@/hooks/useFirebaseData";

// Custom glow animation styles
const glowKeyframes = `
  @keyframes championGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(var(--glow-color), 0.6),
                  0 0 40px rgba(var(--glow-color), 0.4),
                  0 0 60px rgba(var(--glow-color), 0.2);
    }
    50% {
      box-shadow: 0 0 30px rgba(var(--glow-color), 0.8),
                  0 0 60px rgba(var(--glow-color), 0.6),
                  0 0 90px rgba(var(--glow-color), 0.4);
    }
  }
`;

// Color mappings for glow effect
const colorToRgb: Record<string, string> = {
  blue: "59, 130, 246",
  yellow: "251, 191, 36",
  green: "34, 197, 94",
  orange: "249, 115, 22",
  pink: "236, 72, 153",
  purple: "147, 51, 234",
  red: "239, 68, 68",
  slate: "100, 116, 139",
};

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
    const isFirstPlace = place === 1;
    const glowColor = colorToRgb[colorName] || colorToRgb.blue;

    return (
        <>
            {isFirstPlace && (
                <style dangerouslySetInnerHTML={{ __html: glowKeyframes }} />
            )}
            <Link
                className={`grid min-w-400 h-20 place-items-center ${gradientClasses} shadow-lg items-center flex rounded-xl bg-gradient-to-r mb-5 ${outlineThickness} relative overflow-hidden`}
                color={"foreground"}
                href={`/spread/${houseImage.toLowerCase()}`}
                isBlock={true}
                underline={"none"}
                style={isFirstPlace ? {
                    '--glow-color': glowColor,
                    animation: 'championGlow 2s ease-in-out infinite',
                    border: `3px solid rgba(${glowColor}, 0.8)`,
                } as React.CSSProperties : {}}
            >
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage: `url(/house-images/${houseImage.toLowerCase()}.png)`,
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '75% center'
                }}
            />
            <div className="ml-3 text-xl align-middle basis-1/10 font-stretch-100% font-mono font-bold relative z-10">
                {place}
            </div>
            <div className="ms-2 me-2 basis-2/10 flex justify-center items-center w-12 h-12 relative z-10">
                <Image
                    priority
                    alt={name}
                    className="object-center object-contain max-w-full max-h-full"
                    height={50}
                    src={"/house-images/" + houseImage.toLowerCase() + ".png"}
                    width={50}
                />
            </div>

            <p
                className={`ml-1 text-wrap text-center text-4xl align-middle basis-5/10 flex-grow flex-1 overflow-hidden text-ellipsis relative z-10`}
                style={{
                    WebkitTextStroke: '2px white',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.9), -3px -3px 6px rgba(255,255,255,0.8)',
                    fontFamily: 'Impact, "Arial Black", "Franklin Gothic Bold", "Trebuchet MS", sans-serif',
                    fontWeight: '900',
                    letterSpacing: '2px',
                    transform: 'scaleY(1.1)'
                }}
            >
                {name}
            </p>

            <p className="min-w-0 ml-1 me-2 text-xs basis-2/10 font-mono flex-shrink relative z-10">
                Points:
                <br />
                <span className="text-xl font-bold">{totalPoints}</span>
            </p>
        </Link>
        </>
    );
};

export const HousePointsContainer = () => {
    const auth = useAuth();
    const student = auth.userDbData;
    const isAuthenticated = !!auth.user && !auth.loading;
    const { data: houses, isLoading: loading, error } = useHouseSummaries(isAuthenticated);

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
