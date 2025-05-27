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
            'rgba(220, 220, 220, 0.86)', 
            'rgba(200, 200, 200, 0.91)', 
            'rgba(170, 170, 170, 0.7)', 
            'rgba(140, 140, 140, 0.7)', 
            'rgba(100, 100, 100, 0.7)',
          ],
          borderColor: [
            'rgba(80, 80, 80, 1)',
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
            'rgba(240, 240, 240, 0.97)', 
            'rgba(220, 220, 220, 0.91)', 
            'rgba(200, 200, 200, 0.86)', 
            'rgba(170, 170, 170, 0.81)', 
            'rgba(140, 140, 140, 0.76)', 
            'rgba(110, 110, 110, 0.7)',
          ],
          borderColor: [
            'rgba(80, 80, 80, 1)',
        ],
        borderWidth: 3,
      },
    ],
  };



  export default function Home() {
    const router = useRouter();
    return (
        <div className="bg-gray-200 grid place-items-center font-stretch-150% font-mono font-bold text-3xl"> {/* Changing the hight of it, most likely will do this later when adding the different componets and not here*/}
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