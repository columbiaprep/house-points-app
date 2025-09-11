"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type ChartProps = {
    //things were are inputting in spread
    type: "doughnut" | "pie"; //doughnut char or pie chart
    data: any;
    title: string;
    options?: any; //the ? makes the options thing not required
};
//I don't understand this part as much as I had ai help me as in the actual sebastian test I didn't write the option part, Ms.Shott did
export default function PointsChartData({
    type,
    data,
    title,
    options,
}: ChartProps) {
    const chartOptions = {
        ...options, //putting the inputs from options into chartoptions like a ==
        plugins: {
            title: {
                display: true,
                text: title,
                font: { size: 18 },
            },
            ...options?.plugins,
        },
        animation: {
            delay: 1000,
            ...options?.animation,
        },
    };

    const ChartComponent = type == "pie" ? Pie : Doughnut; //choosing which chart to render, if it is pie later in spread it will be pie, if not doughnut(if else ?)

    return <ChartComponent data={data} options={chartOptions} />;
}
