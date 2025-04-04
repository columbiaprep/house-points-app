import Image from "next/image";

  {/* setting up each prop */}
interface IndependentHouseProps{
    colorName: string,
    accentColor: string,
  houseImage: string,
  houseName: string,
  fontSize: string,
  amountPoints: string

}
  {/* setting up the fake dataset */}
const houseData = [
    {
        colorName: "green",
        accentColor: "emerald",
      houseImage: "/globe.svg",
      houseName: "Green Ivy",
      fontSize: "5",
      amountPoints: "1264"
    
    },
    {
        colorName: "pink",
        accentColor: "fuchsia",
      houseImage: "/globe.svg",
      houseName: "Pink Panthers",
      fontSize: "5",
      amountPoints: "789"
    
    },
    {
        colorName: "cyan",
        accentColor: "blue",
      houseImage: "/globe.svg",
      houseName: "Blue Thunder",
      fontSize: "5",
      amountPoints: "978"
    
    },
    {
        colorName: "red",
        accentColor: "rose",
      houseImage: "/globe.svg",
      houseName: "Red Phenix",
      fontSize: "5",
      amountPoints: "1678"
    
    },
    {
        colorName: "purple",
        accentColor: "violet",
      houseImage: "/globe.svg",
      houseName: "Purple Reign",
      fontSize: "5",
      amountPoints: "789"
    
    },
    {
        colorName: "yellow",
        accentColor: "yellow",
      houseImage: "/globe.svg",
      houseName: "Golden Hearts",
      fontSize: "5",
      amountPoints: "682"
    
    },
    {
        colorName: "orange",
        accentColor: "amber",
      houseImage: "/globe.svg",
      houseName: "Orange Supernova",
      fontSize: "4",
      amountPoints: "827"
    
    },
    {
        colorName: "gray",
        accentColor: "slate",
      houseImage: "/globe.svg",
      houseName: "Silver Knights",
      fontSize: "5",
      amountPoints: "998"
    
    }
  ]


export const HousePointsRow: React.FC<IndependentHouseProps> = ({colorName, houseImage, amountPoints, houseName, accentColor, fontSize}) => {
    return (
<div className="grid place-items-center min-w-screen">
                <div className={`shadow-lg flex flex-row h-14 w-full rounded-xl bg-gradient-to-r hover:outline outline-4 from-${colorName}-400 to-${accentColor}-700 outline-${accentColor}-900 shadow-${colorName}-500/50 outline-${accentColor}-900"}`}>
            {/* Div above will be a button later to take you to the houses page */}
            
            {/* Also the distance between House name and Points would change once I could get it to be smaller then the whole page */}
            <Image
            className=" object-center dark:invert flex-initial"
            src= {houseImage}
            alt= {houseName}
            width={180}
            height={38}
            priority
            />
        
            <p className ={`basis-3/5 font-stretch-150% font-mono font-bold text-${fontSize}xl flex-1 basis-16`}>
            {houseName}
            </p>

            <p className ="basis-2/5 font-stretch-100% font-mono font-medium text-4xl flex-1 basis-16">
            Points: {amountPoints}
            </p>
            
        </div>
        <div className="h-2">
            {/* Spacing between different houses */}

        </div> 
                </div>
            
    )
}

export const HousePointsContainer = () => {
    return(
        <div className="bg-slate-800 grid place-items-center min-h-screen min-w-screen"> {/* Any settings on the container should be added to the div to the left (like border, etc.) */}
        <div className=""> 
            {houseData.map((house, index) => (
                <HousePointsRow houseName={house.houseName} colorName={house.colorName} accentColor={house.accentColor} houseImage={house.houseImage} amountPoints={house.amountPoints} fontSize={house.fontSize}/>
                

                
                
            ))}
    </div>
        </div>
    )    
}