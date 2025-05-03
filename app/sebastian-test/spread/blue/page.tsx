"use client";

import { useRouter } from "next/navigation";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Pie } from 'react-chartjs-2';
import { fetchIndividual } from "@/firebase-configuration/firebaseDb";



ChartJS.register(ArcElement, Tooltip, Legend);
export const options = {
    scales: {  
      y: {
        beginAtZero: true,
      },
    },
  };
  
export const housePointsSpread = {
    title: {
        display: true,
        text: 'House Points Spread'
    },
    labels: ['School Events', 'House Challenges', 'House Drives', "My Points", "Others Points"],
    datasets: [
      {
        label: '# of Ponts',
        data: [12, 19, 3, 5, 50],
        backgroundColor: [
            'rgba(173, 216, 230, 0.86)',
            'rgba(100, 180, 255, 0.91)', 
            'rgba(70, 130, 180, 0.7)', 
            'rgba(40, 90, 150, 0.7)', 
            'rgba(10, 30, 80, 0.7)',
          ],
          borderColor: [
            'rgba(30, 100, 160, 1)',
   
        ],
        borderWidth: 3,
      },
    ],
  };
  export const personalPointsSpread = {
    title: {
        display: true,
        text: 'Personal Points Spread'
    },
    labels: ["Caught Being Good", "Support (attending events)", "Participation (season long extracurriculars)","Attendance","Community Service", "Events"],
    datasets: [
      {
        label: '# of Points',
        data: [30,5,9,16,20,22],
        backgroundColor: [
            'rgba(100, 200, 255, 0.94)',
            'rgba(70, 170, 240, 0.89)',
            'rgba(50, 140, 220, 0.85)', 
            'rgba(30, 110, 200, 0.8)', 
            'rgba(20, 90, 180, 0.75)', 
            'rgba(10, 60, 150, 0.7)',
          ],
          borderColor: [
           'rgba(30, 100, 160, 1)',

      
        ],
        borderWidth: 3,
      },
    ],
  };



  export default function Home() {
    const router = useRouter();

    const individualData = fetchIndividual("srosado26@cgps.org")
    console.log(individualData)

    return (
        <div className="bg-blue-200 grid place-items-center font-stretch-150% font-mono font-bold text-3xl"> {/* Changing the hight of it, most likely will do this later when adding the different componets and not here*/}
<div>
<p className="grid place-items-center">
        HOUSE SPREAD
</p>
<Doughnut 
  data={housePointsSpread} 
  options={{ 
    plugins: {  //trying to add title
      title: { 
        display: true,
        text: 'Personal Points Spread', 
        font: {
            size: 18,
      },
     } 
      
    },
    animation: {
      delay: 1000, // delay in milliseconds
    },
  }} 
/>
</div>
<div>
<p className="grid place-items-center mt-10">  {/* mt-10 adds space between the two graphs*/}
        Personal Spread
</p> 
<Pie 
  data={personalPointsSpread} 
  options={{ 
    plugins: { 
      title: { display: true, text: 'Personal Points Spread' } 
    },
    animation: {
      delay: 1000, // delay in milliseconds
    },
  }} 
/>
</div>            
</div>
    )
}