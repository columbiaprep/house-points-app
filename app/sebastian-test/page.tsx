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
  
export const data = {
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
            'rgba(71, 204, 98, 0.5)',
            'rgba(71, 181, 93, 0.5)',
            'rgba(46, 161, 33, 0.5)',
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
  export const data2 = {
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
            'rgba(71, 204, 98, 0.5)',
            'rgba(71, 181, 93, 0.5)',
            'rgba(46, 161, 33, 0.5)',
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
        <div style={{ height: '300px' }}>
            <Doughnut data={data} options={{ plugins: { title: { display: true, text: 'House Points Spread' } } }} />
            <Pie data={data2} options={{ plugins: { title: { display: true, text: 'Personal Points Spread' } } }} />
            
</div>
    )
}