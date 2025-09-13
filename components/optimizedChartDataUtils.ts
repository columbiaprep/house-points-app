// Optimized utility functions for generating chart data using aggregated collections

import { collection, getDocs } from "@firebase/firestore";

import { generateHouseColors, generateBorderColors } from "./chartColorUtils";

import {
    fetchHouseChartData,
    fetchStudentChartData,
} from "@/firebase-configuration/optimizedFirebaseDb";
import { db } from "@/firebase-configuration/firebaseApp";

interface PointCategory {
    key: string;
    name: string;
    description: string;
}

// Helper function to get point categories (cached)
let cachedCategories: PointCategory[] | null = null;

async function getPointCategories(): Promise<PointCategory[]> {
    if (cachedCategories) {
        return cachedCategories;
    }

    const pointCategoriesSnapshot = await getDocs(
        collection(db, "pointCategories"),
    );

    cachedCategories = pointCategoriesSnapshot.docs.map(
        (doc) => doc.data() as PointCategory,
    );

    return cachedCategories;
}

/**
 * OPTIMIZED: Generate chart data for house-wide points by category
 * Reduces from ~8 reads to 1 read from houseSummaries
 */
export async function generateOptimizedHouseChartData(houseColorName: string) {
    try {
        const categories = await getPointCategories();
        const houseData = await fetchHouseChartData(houseColorName);

        if (!houseData) {
            throw new Error(`No house found with color: ${houseColorName}`);
        }

        // Extract point values for each category
        const labels: string[] = [];
        const data: number[] = [];

        categories.forEach((category) => {
            if (houseData[category.key] && houseData[category.key] > 0) {
                labels.push(`${category.name}: ${houseData[category.key]} pts`);
                data.push(houseData[category.key]);
            }
        });

        // Generate colors based on house color
        const backgroundColors = generateHouseColors(
            houseColorName,
            labels.length,
        );
        const borderColors = generateBorderColors(
            houseColorName,
            labels.length,
        );

        return {
            labels,
            datasets: [
                {
                    label: `${houseData.name} House Points`,
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                },
            ],
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            boxWidth: 15,
                            padding: 10,
                            usePointStyle: true,
                            generateLabels: function (chart: any) {
                                const data = chart.data;

                                if (
                                    data.labels.length &&
                                    data.datasets.length
                                ) {
                                    return data.labels.map(
                                        (label: string, index: number) => {
                                            const dataset = data.datasets[0];
                                            const value = dataset.data[index];

                                            return {
                                                text: `${label.split(":")[0]}: ${value} pts`,
                                                fillStyle:
                                                    dataset.backgroundColor[
                                                        index
                                                    ],
                                                strokeStyle:
                                                    dataset.borderColor[index],
                                                lineWidth: dataset.borderWidth,
                                                hidden: false,
                                                index: index,
                                            };
                                        },
                                    );
                                }

                                return [];
                            },
                        },
                    },
                },
                layout: {
                    padding: {
                        bottom: 20,
                    },
                },
            },
        };
    } catch (error) {
        console.error("Error generating optimized house chart data:", error);

        // Return fallback data
        return {
            labels: ["No Data"],
            datasets: [
                {
                    label: "House Points",
                    data: [0],
                    backgroundColor: ["rgba(107, 114, 128, 0.5)"],
                    borderColor: ["rgba(107, 114, 128, 1)"],
                    borderWidth: 1,
                },
            ],
        };
    }
}

/**
 * OPTIMIZED: Generate chart data for individual student's points by category
 * Reduces from ~400 reads to 1 read from houseRankings
 */
export async function generateOptimizedPersonalChartData(
    studentEmail: string,
    houseColorName: string,
    houseName: string,
) {
    try {
        const categories = await getPointCategories();
        const studentData = await fetchStudentChartData(
            studentEmail,
            houseName,
        );

        if (!studentData) {
            throw new Error(`No student found with email: ${studentEmail}`);
        }

        // Extract point values for each category
        const labels: string[] = [];
        const data: number[] = [];

        categories.forEach((category) => {
            if (studentData[category.key] && studentData[category.key] > 0) {
                labels.push(
                    `${category.name}: ${studentData[category.key]} pts`,
                );
                data.push(studentData[category.key]);
            }
        });

        // Generate colors based on house color
        const backgroundColors = generateHouseColors(
            houseColorName,
            labels.length,
            0.7,
        );
        const borderColors = generateBorderColors(
            houseColorName,
            labels.length,
        );

        return {
            labels,
            datasets: [
                {
                    label: "Personal Points",
                    data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                },
            ],
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            boxWidth: 15,
                            padding: 10,
                            usePointStyle: true,
                            generateLabels: function (chart: any) {
                                const data = chart.data;

                                if (
                                    data.labels.length &&
                                    data.datasets.length
                                ) {
                                    return data.labels.map(
                                        (label: string, index: number) => {
                                            const dataset = data.datasets[0];
                                            const value = dataset.data[index];

                                            return {
                                                text: `${label.split(":")[0]}: ${value} pts`,
                                                fillStyle:
                                                    dataset.backgroundColor[
                                                        index
                                                    ],
                                                strokeStyle:
                                                    dataset.borderColor[index],
                                                lineWidth: dataset.borderWidth,
                                                hidden: false,
                                                index: index,
                                            };
                                        },
                                    );
                                }

                                return [];
                            },
                        },
                    },
                },
                layout: {
                    padding: {
                        bottom: 20,
                    },
                },
            },
        };
    } catch (error) {
        console.error("Error generating optimized personal chart data:", error);

        // Return fallback data
        return {
            labels: ["No Data"],
            datasets: [
                {
                    label: "Personal Points",
                    data: [0],
                    backgroundColor: ["rgba(107, 114, 128, 0.5)"],
                    borderColor: ["rgba(107, 114, 128, 1)"],
                    borderWidth: 1,
                },
            ],
        };
    }
}
