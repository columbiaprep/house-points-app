import Image from "next/image";
import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import {useAuth} from "@/contexts/AuthContext"
import { fetchAllHouses, IndividualDocument } from "@/firebase-configuration/firebaseDb";
import { HouseDocument } from "@/firebase-configuration/firebaseDb";
import {Link} from "@heroui/link";

export const HousePointsRow: React.FC<HouseDocument> = ({id, place, name, colorName, accentColor, houseImage, totalPoints, isStudentHouse}) => {

    const gradientClasses = `from-${colorName}-400 to-${accentColor}-700 outline-${accentColor}-900 shadow-${colorName}-500/50`
    const outlineThickness = isStudentHouse ? "outline-8" : "hover:outline-4"
    return (
            <Link 
                className={`grid min-w-400 max-h-200 place-items-center ${gradientClasses} shadow-lg items-center flex rounded-xl bg-gradient-to-r mb-5 ${outlineThickness} `}
                href={`/spread/${houseImage}`}
                underline={"none"}
                isBlock={true}
                color={"foreground"}
                
            >  
                    <div className="ml-3 text-xl align-middle basis-1/10 font-stretch-100% font-mono font-bold">
                        {place}
                    </div>
                    <Image
                    className="ms-2 me-2 object-center object-contain basis-2/10"
                    src= {"/houseImages/"+ houseImage + ".png"}
                    alt= {name}
                    width={50}
                    height={50}
                    priority
                    />
                
                    <p className ={`ml-1 text-wrap text-center text-2xl align-middle basis-5/10 flex-grow font-stretch-100% font-mono font-bold flex-1 overflow-hidden text-ellipsis`}>
                        {name} 
                    </p>

                    <p className ="min-w-0 ml-1 me-2 text-xs basis-2/10 font-mono flex-shrink">
                        Points:<br /><span className="text-xl font-bold">{totalPoints}</span>
                    </p>
            </Link>
    )
}


export const HousePointsContainer = () => {
    //anything I'm fetching needs to use the below format
    //import the appropriate interface from the database
    const [houses, setHouses] = useState<HouseDocument[]>([]);

    //this keeps track of the loading state of the component
    const [loading, setLoading] = useState(false);

    const student = useAuth().userDbData

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

    return(
        <div className="grid min-h-screen min-w-screen place-items-center"> {/* Any settings on the container should be added to the div to the left (like border, etc.) */}
            {loading ? (
                <Spinner classNames={{label: "text-foreground mt-4"}} label="wave" variant="wave" />
                ) : 
            (   
            <div className="min-w-min w-1/2"> 
                {houses.map((house, index) => (
                    
                    <HousePointsRow 
                        key = {index} 
                        name={house.name} 
                        colorName={house.colorName} 
                        accentColor={house.accentColor} 
                        houseImage={house.name.split(" ")[0]} 
                        totalPoints={house.totalPoints}
                        id={house.name}
                        place={house.place}
                        isStudentHouse={house.name == student.house}
                        />
                ))}
            </div>
            )
            }
        </div>
    );
};
