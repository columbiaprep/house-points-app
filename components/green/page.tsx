"use client";

import { useRouter } from "next/navigation";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";

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
        text: "House Points Spread",
    },
    labels: [
        "School Events",
        "House Challenges",
        "House Drives",
        "My Points",
        "Others Points",
    ],
    datasets: [
        {
            label: "# of Ponts",
            data: [12, 19, 3, 5, 50],
            backgroundColor: [
                "rgba(108, 245, 136, 0.86)",
                "rgba(40, 213, 75, 0.91)",
                "rgba(26, 187, 8, 0.7)",
                "rgba(17, 136, 21, 0.7)",
                "rgba(6, 61, 5, 0.7)",
            ],
            borderColor: [
                "rgb(7, 68, 12)",
                "rgb(7, 68, 12)",
                "rgb(7, 68, 12)",
                "rgb(7, 68, 12)",
                "rgb(7, 68, 12)",
            ],
            borderWidth: 3,
        },
    ],
};
export const personalPointsSpread = {
    title: {
        display: true,
        text: "Personal Points Spread",
    },
    labels: [
        "Caught Being Good",
        "Support (attending events)",
        "Participation (season long extracurriculars)",
        "Attendance",
        "Community Service",
        "Events",
    ],
    datasets: [
        {
            label: "# of Points",
            data: [30, 5, 9, 16, 20, 22],
            backgroundColor: [
                "rgba(120, 255, 120, 0.94)",
                "rgba(90, 230, 90, 0.89)",
                "rgba(70, 200, 70, 0.84)",
                "rgba(15, 168, 15, 0.79)",
                "rgba(12, 162, 12, 0.74)",
                "rgba(9, 88, 9, 0.7)",
            ],
            borderColor: ["rgb(7, 68, 12)", "rgb(7, 68, 12)", "rgb(7, 68, 12)"],
            borderWidth: 3,
        },
    ],
};

export default function Home() {
    const router = useRouter();

    return (
        <div className="bg-green-200 grid place-items-center font-stretch-150% font-mono font-bold text-3xl">
            {" "}
            {/* Changing the hight of it, most likely will do this later when adding the different componets and not here*/}
            <div>
                <p className="grid place-items-center">HOUSE SPREAD</p>
                <Doughnut
                    data={housePointsSpread}
                    options={{
                        plugins: {
                            //trying to add title
                            title: {
                                display: true,
                                text: "Personal Points Spread",
                                font: {
                                    size: 18,
                                },
                            },
                        },
                        animation: {
                            delay: 1000, // delay in milliseconds
                        },
                    }}
                />
            </div>
            <div>
                <p className="grid place-items-center mt-10">
                    {" "}
                    {/* mt-10 adds space between the two graphs*/}
                    Personal Spread
                </p>
                <Pie
                    data={personalPointsSpread}
                    options={{
                        plugins: {
                            title: {
                                display: true,
                                text: "Personal Points Spread",
                            },
                        },
                        animation: {
                            delay: 1000, // delay in milliseconds
                        },
                    }}
                />
            </div>
        </div>
    );
}
