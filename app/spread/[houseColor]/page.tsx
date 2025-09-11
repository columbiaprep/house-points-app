"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/contexts/AuthContext'
import PointsChartData from "@/components/pointsChart";
import { housePointsSpread, personalPointsSpread } from "@/components/house-points-spread";
import { fetchAllHouses, IndividualDocument } from "@/firebase-configuration/firebaseDb";
import { HouseDocument } from "@/firebase-configuration/firebaseDb";
import {Link} from "@heroui/link";



const HouseSpreadPage = () => { 
    //use params returns the string in the URL
    const { houseColor } = useParams();
    const student = useAuth().userDbData
    const housecolor = typeof houseColor === "string" ? houseColor.toLowerCase() : ""; //if not null changes houseColor to lowercase so I can use in the coloring
    //as well as checking if is a string and not an array (why can this be an array??)
    

    return (
        <div>
  
        <h1>I have {student?.totalPoints}</h1>
        <h1>I am in { houseColor }</h1>

    
    
        <div className={`bg-${housecolor}-200 grid place-items-center font-mono font-bold text-3xl`}>
            <div>
                <p className="grid place-items-center">HOUSE SPREAD</p>
                <PointsChartData 
                    type="doughnut" 
                    data={housePointsSpread} 
                    title="House Points Spread" 
                    />
                </div>

            <div>
                <p className="grid place-items-center mt-10">Personal Spread</p>
                <PointsChartData 
                type="pie" 
                data={personalPointsSpread} 
                title="Personal Points Spread" 
                />
            </div>
            </div>
        </div>
        
    )
  }
  export default HouseSpreadPage;

