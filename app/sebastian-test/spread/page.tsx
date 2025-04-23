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
    labels: ['Good Points', 'House Events', 'School Events', "My Points", "Others Points"],
    datasets: [
      {
        label: '# of Ponts',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
            'rgba(108, 245, 136, 0.86)',
            'rgba(40, 213, 75, 0.91)',
            'rgba(26, 187, 8, 0.7)',
            'rgba(17, 136, 21, 0.7)',
            'rgba(6, 61, 5, 0.7)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',        
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
    labels: ['Good Points', 'House Events', 'School Events'],
    datasets: [
      {
        label: '# of Points',
        data: [30,5,9],
        backgroundColor: [
            'rgba(22, 236, 64, 0.6)',
            'rgba(1, 170, 35, 0.6)',
            'rgba(10, 94, 27, 0.6)',
            'rgba(17, 136, 25, 0.5)',
            'rgba(6, 61, 5, 0.5)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',
            'rgb(7, 68, 12)',        
        ],
        borderWidth: 3,
      },
    ],
  };



  export default function Home() {
    const router = useRouter();
    return (
        <div className="bg-green-200 grid place-items-center font-stretch-150% font-mono font-bold text-3xl"> {/* Changing the hight of it, most likely will do this later when adding the different componets and not here*/}
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