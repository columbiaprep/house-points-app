import Image from "next/image";
import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllHouses } from "@/firebase-configuration/firebaseDb";
import { HouseDocument } from "@/firebase-configuration/firebaseDb";
import { Link } from "@heroui/link";
import '../leaderboard.css'; // Custom CSS for leaderboard styling
import { motion } from "framer-motion"; // Animation library used for entrance and hover effects  

// Map house colors to glow colors on the leaderboard 
const glowColorsMap: Record<string, string> = {
  gold: "#FFD700",
  purple: "#A020F0",
  red: "#FF4500",
  blue: "#1E90FF",
  green: "#32CD32",
  yellow: "#FFFF00",
  orange: "#FFA500",
  pink: "#FF69B4",
  silver: "#C0C0C0",
  gray: "#C0C0C0",  // treating gray as silver for consistent glow
  slate: "#C0C0C0" // same as above
};

// Function to determine the final glow color based on colorName and accentColor
function getGlowColor(colorName: string, accentColor: string): string {
  return (
    glowColorsMap[accentColor.toLowerCase()] ||
    glowColorsMap[colorName.toLowerCase()] ||
    "#fff" // Default white glow
  );
}

export const HousePointsRow: React.FC<HouseDocument> = ({
  place,
  name,
  colorName,
  accentColor,
  houseImage,
  totalPoints,
  isStudentHouse,
}) => {
  const gradientClasses = `from-${colorName}-400 to-${accentColor}-700 shadow-lg bg-gradient-to-r`;
  const outlineThickness = isStudentHouse ? "outline-8" : "hover:outline-4";

  return (
    <Link
      className={`grid min-w-400 max-h-200 place-items-center ${gradientClasses} items-center flex rounded-xl mb-5 ${outlineThickness}`}
      href={`/spread/${houseImage}`}
      underline="none"
      isBlock={true}
      color="foreground"
    >
      <div className="ml-3 text-xl align-middle basis-1/10 font-bold font-mono">{place}</div>
      <Image
        className="ms-2 me-2 object-center object-contain basis-2/10"
        src={"/houseImages/" + houseImage + ".png"}
        alt={name}
        width={50}
        height={50}
        priority
      />
      <p className="ml-1 text-wrap text-center text-2xl align-middle basis-5/10 font-bold font-mono flex-1 overflow-hidden text-ellipsis">{name}</p>
      <p className="min-w-0 ml-1 me-2 text-xs basis-2/10 font-mono flex-shrink">
        Points:<br />
        <span className="text-xl font-bold">{totalPoints}</span>
      </p>
    </Link>
  );
};

// Component that fetches and displays all houses
export const HousePointsContainer = () => {
  const [houses, setHouses] = useState<HouseDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const student = useAuth().userDbData;

  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      const start = Date.now();
      const h = await fetchAllHouses();
      setHouses(h);
      const elapsed = Date.now() - start;
      const remaining = 1000 - elapsed;
      if (remaining > 0) setTimeout(() => setLoading(false), remaining);
      else setLoading(false);
    };
    loadData();
  }, []);

  // Return the visual structure of the component
  return (
    <div className="grid min-h-screen min-w-screen place-items-center">
      {loading ? (
        <Spinner classNames={{ label: "text-foreground mt-4" }} variant="wave" />
      ) : (
        // Once loading is complete, render the leaderboard container
        <div className="min-w-min w-1/2">
          {/* Loop through each house to display them on the leaderboard */}
          {houses.map((house, index) => { 
            console.log(house.name, house.colorName, house.accentColor); // Print house data to the console for debugging did this becuase silver house was giving me errors
            const glowColor = getGlowColor(house.colorName, house.accentColor); // Get the glow color based on house color and accent color
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="mb-5"
>
    <div 
    {/* Outer wrapper that adds glowing border effect */}
    className="glow-border-container"
    style={{ "--glow-color": glowColor } as React.CSSProperties}
  >

            <HousePointsRow {/* Render a single row on the leaderboard for the house */}
                name={house.name}
                colorName={house.colorName}
                accentColor={house.accentColor}
                houseImage={house.name.split(" ")[0]}
                totalPoints={house.totalPoints}
                id={house.name}
                place={house.place}
                isStudentHouse={house.name === student.house}
                />
            </div>
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
