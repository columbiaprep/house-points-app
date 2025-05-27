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
            'rgb(255, 102, 102)', 
            'rgba(255, 50, 50, 0.91)', 
            'rgba(200, 0, 0, 0.7)', 
            'rgba(150, 0, 0, 0.7)', 
            'rgba(80, 0, 0, 0.7)',
          ],
          borderColor: [
            'rgba(100, 20, 20, 1)',    
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
            'rgba(255, 80, 80, 0.95)',
            'rgba(235, 60, 60, 0.9)', 
            'rgba(210, 40, 40, 0.85)', 
            'rgba(180, 20, 20, 0.8)', 
            'rgba(150, 10, 10, 0.75)', 
            'rgba(120, 5, 5, 0.7)',
          ],
          borderColor: [
            'rgba(100, 20, 20, 1)',     
        ],
        borderWidth: 3,
      },
    ],
  };



  export default function Home() {
    const router = useRouter();
    return (
        <div className="bg-red-200 grid place-items-center font-stretch-150% font-mono font-bold text-3xl"> {/* Changing the hight of it, most likely will do this later when adding the different componets and not here*/}
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