"use client";

import { useRouter } from "next/navigation";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Pie } from 'react-chartjs-2';



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
            'rgba(200, 150, 255, 0.86)', 
            'rgba(180, 100, 240, 0.91)', 
            'rgba(140, 60, 220, 0.7)', 
            'rgba(100, 40, 160, 0.7)', 
            'rgba(60, 20, 100, 0.7)',
          ],
          borderColor: [
            'rgba(60, 30, 100, 1)',
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
            'rgba(200, 140, 255, 0.93)', 
            'rgba(180, 110, 240, 0.88)', 
            'rgba(150, 80, 220, 0.83)', 
            'rgba(120, 60, 200, 0.78)', 
            'rgba(90, 40, 170, 0.74)', 
            'rgba(60, 20, 140, 0.7)',
          ],
          borderColor: [
            'rgba(60, 30, 100, 1)',
        ],
        borderWidth: 3,
      },
    ],
  };



  export default function Home() {
    const router = useRouter();
    return (
        <div className="bg-purple-200 grid place-items-center font-stretch-150% font-mono font-bold text-3xl"> {/* Changing the hight of it, most likely will do this later when adding the different componets and not here*/}
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