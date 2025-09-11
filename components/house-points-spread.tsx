"use client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);
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
                "rgba(173, 216, 230, 0.86)",
                "rgba(100, 180, 255, 0.91)",
                "rgba(70, 130, 180, 0.7)",
                "rgba(40, 90, 150, 0.7)",
                "rgba(10, 30, 80, 0.7)",
            ],
            borderColor: ["rgba(30, 100, 160, 1)"],
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
                "rgba(100, 200, 255, 0.94)",
                "rgba(70, 170, 240, 0.89)",
                "rgba(50, 140, 220, 0.85)",
                "rgba(30, 110, 200, 0.8)",
                "rgba(20, 90, 180, 0.75)",
                "rgba(10, 60, 150, 0.7)",
            ],
            borderColor: ["rgba(30, 100, 160, 1)"],
            borderWidth: 3,
        },
    ],
};
