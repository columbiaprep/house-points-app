// Utility functions for generating chart data from Firebase collections

import { collection, getDocs, where, query } from "@firebase/firestore";

import { generateHouseColors, generateBorderColors } from "./chartColorUtils";

import { fetchHouseChartData } from "@/firebase-configuration/optimizedFirebaseDb";
import { db } from "@/firebase-configuration/firebaseApp";
import {
    HouseDocument,
    IndividualDocument,
    PointCategory,
    calculateHouseBonusPoints,
} from "@/firebase-configuration/firebaseDb";

/**
 * Generate chart data for house-wide points by category
 */
export async function generateHouseChartData(houseColorName: string) {
    try {
        // Get point categories first
        const pointCategoriesSnapshot = await getDocs(
            collection(db, "pointCategories"),
        );
        const categories = pointCategoriesSnapshot.docs.map(
            (doc) => doc.data() as PointCategory,
        );

        // Try to use the optimized function first, fall back to original method
        let houseData = await fetchHouseChartData(houseColorName);

        if (!houseData) {
            console.log(
                `No house found in aggregated data for ${houseColorName}, falling back to original method`,
            );

            // Fallback to original method
            const housesQuery = query(
                collection(db, "houses"),
                where("colorName", "==", houseColorName),
            );
            const housesSnapshot = await getDocs(housesQuery);

            if (housesSnapshot.empty) {
                // Try finding by document ID or partial match if colorName doesn't work
                const allHousesSnapshot = await getDocs(
                    collection(db, "houses"),
                );
                const houseDoc = allHousesSnapshot.docs.find((doc) => {
                    const data = doc.data();

                    return (
                        data.colorName === houseColorName ||
                        doc.id === houseColorName ||
                        data.colorName?.toLowerCase() ===
                            houseColorName.toLowerCase() ||
                        data.name
                            ?.toLowerCase()
                            .includes(houseColorName.toLowerCase())
                    );
                });

                if (!houseDoc) {
                    throw new Error(
                        `No house found with color: ${houseColorName}`,
                    );
                }

                houseData = houseDoc.data() as HouseDocument;
            } else {
                houseData = housesSnapshot.docs[0].data() as HouseDocument;
            }
        }

        // Extract point values for each category (include 0 values to show structure)
        const labels: string[] = [];
        const data: number[] = [];

        categories.forEach((category) => {
            // Skip totalPoints as it's calculated, not directly added to
            if (category.key === 'totalPoints') {
                return;
            }
            const points = houseData[category.key] || 0;
            labels.push(`${category.name}: ${points} pts`);
            data.push(points);
        });

        // Check if all data is zero
        const allZero = data.every(value => value === 0);

        // Return null for all-zero data - will be handled in the component
        if (allZero) {
            return null;
        }

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
                            generateLabels: function (chart) {
                                const data = chart.data;

                                if (
                                    data.labels.length &&
                                    data.datasets.length
                                ) {
                                    return data.labels.map((label, index) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[index];

                                        return {
                                            text: `${label.split(":")[0]}: ${value} pts`,
                                            fillStyle:
                                                dataset.backgroundColor[index],
                                            strokeStyle:
                                                dataset.borderColor[index],
                                            lineWidth: dataset.borderWidth,
                                            hidden: false,
                                            index: index,
                                        };
                                    });
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
        console.error("Error generating house chart data:", error);

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
 * Generate chart data for individual student's points by category
 */
export async function generatePersonalChartData(
    studentEmail: string,
    houseColorName: string,
) {
    try {
        // Get point categories first
        const pointCategoriesSnapshot = await getDocs(
            collection(db, "pointCategories"),
        );
        const categories = pointCategoriesSnapshot.docs.map(
            (doc) => doc.data() as PointCategory,
        );

        // Get individual student document by email (document ID)
        const individualsQuery = query(collection(db, "individuals"));
        const individualsSnapshot = await getDocs(individualsQuery);

        const studentDoc = individualsSnapshot.docs.find(
            (doc) => doc.id === studentEmail,
        );

        if (!studentDoc) {
            throw new Error(`No student found with email: ${studentEmail}`);
        }

        const studentData = studentDoc.data() as IndividualDocument;

        // Extract point values for each category
        const labels: string[] = [];
        const data: number[] = [];

        categories.forEach((category) => {
            // Skip totalPoints as it's calculated, not directly added to
            if (category.key === 'totalPoints') {
                return;
            }
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
        ); // Slightly more transparent
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
                            generateLabels: function (chart) {
                                const data = chart.data;

                                if (
                                    data.labels.length &&
                                    data.datasets.length
                                ) {
                                    return data.labels.map((label, index) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[index];

                                        return {
                                            text: `${label.split(":")[0]}: ${value} pts`,
                                            fillStyle:
                                                dataset.backgroundColor[index],
                                            strokeStyle:
                                                dataset.borderColor[index],
                                            lineWidth: dataset.borderWidth,
                                            hidden: false,
                                            index: index,
                                        };
                                    });
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
        console.error("Error generating personal chart data:", error);

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

/**
 * Generate chart data for student-only points by category for a specific house
 */
export async function generateHouseStudentChartData(houseColorName: string) {
    try {
        // Get point categories first
        const pointCategoriesSnapshot = await getDocs(
            collection(db, "pointCategories"),
        );
        const categories = pointCategoriesSnapshot.docs.map(
            (doc) => doc.data() as PointCategory,
        );

        // Find the house to get its exact name
        let houseName = "";

        // Try to find house by colorName first
        const housesQuery = query(
            collection(db, "houses"),
            where("colorName", "==", houseColorName),
        );
        const housesSnapshot = await getDocs(housesQuery);

        if (housesSnapshot.empty) {
            // Try finding by partial match if colorName doesn't work
            const allHousesSnapshot = await getDocs(
                collection(db, "houses"),
            );
            const houseDoc = allHousesSnapshot.docs.find((doc) => {
                const data = doc.data();
                return (
                    data.colorName === houseColorName ||
                    data.colorName?.toLowerCase() === houseColorName.toLowerCase() ||
                    data.name?.toLowerCase().includes(houseColorName.toLowerCase())
                );
            });

            if (!houseDoc) {
                throw new Error(`No house found with color: ${houseColorName}`);
            }
            houseName = houseDoc.data().name;
        } else {
            houseName = housesSnapshot.docs[0].data().name;
        }

        // Get all students from this house
        const individualsQuery = query(
            collection(db, "individuals"),
            where("house", "==", houseName),
        );
        const individualsSnapshot = await getDocs(individualsQuery);

        // Aggregate student points by category
        const categoryTotals: Record<string, number> = {};
        individualsSnapshot.docs.forEach((doc) => {
            const studentData = doc.data() as IndividualDocument;
            categories.forEach((category) => {
                if (category.key !== 'totalPoints') {
                    const points = studentData[category.key] || 0;
                    categoryTotals[category.key] = (categoryTotals[category.key] || 0) + points;
                }
            });
        });

        // Build chart data
        const labels: string[] = [];
        const data: number[] = [];

        categories.forEach((category) => {
            if (category.key === 'totalPoints') {
                return;
            }
            const points = categoryTotals[category.key] || 0;
            labels.push(`${category.name}: ${points} pts`);
            data.push(points);
        });

        // Check if all data is zero
        const allZero = data.every(value => value === 0);

        if (allZero) {
            return null;
        }

        // Generate colors based on house color
        const backgroundColors = generateHouseColors(houseColorName, labels.length);
        const borderColors = generateBorderColors(houseColorName, labels.length);

        return {
            labels,
            datasets: [
                {
                    label: `${houseName} Student Points`,
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
                            generateLabels: function (chart) {
                                const data = chart.data;

                                if (
                                    data.labels.length &&
                                    data.datasets.length
                                ) {
                                    return data.labels.map((label, index) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[index];

                                        return {
                                            text: `${label.split(":")[0]}: ${value} pts`,
                                            fillStyle:
                                                dataset.backgroundColor[index],
                                            strokeStyle:
                                                dataset.borderColor[index],
                                            lineWidth: dataset.borderWidth,
                                            hidden: false,
                                            index: index,
                                        };
                                    });
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
        console.error("Error generating student chart data:", error);
        return null;
    }
}

/**
 * Generate chart data for bonus points by category for a specific house
 */
export async function generateHouseBonusChartData(houseColorName: string) {
    try {
        // Get point categories first
        const pointCategoriesSnapshot = await getDocs(
            collection(db, "pointCategories"),
        );
        const categories = pointCategoriesSnapshot.docs.map(
            (doc) => doc.data() as PointCategory,
        );

        // Find the house to get its ID
        let houseId = "";
        let houseName = "";

        const housesQuery = query(
            collection(db, "houses"),
            where("colorName", "==", houseColorName),
        );
        const housesSnapshot = await getDocs(housesQuery);

        if (housesSnapshot.empty) {
            // Try finding by partial match if colorName doesn't work
            const allHousesSnapshot = await getDocs(
                collection(db, "houses"),
            );
            const houseDoc = allHousesSnapshot.docs.find((doc) => {
                const data = doc.data();
                return (
                    data.colorName === houseColorName ||
                    data.colorName?.toLowerCase() === houseColorName.toLowerCase() ||
                    data.name?.toLowerCase().includes(houseColorName.toLowerCase())
                );
            });

            if (!houseDoc) {
                throw new Error(`No house found with color: ${houseColorName}`);
            }
            houseId = houseDoc.id;
            houseName = houseDoc.data().name;
        } else {
            const houseDoc = housesSnapshot.docs[0];
            houseId = houseDoc.id;
            houseName = houseDoc.data().name;
        }

        // Get bonus points by category
        const bonusTotals = await calculateHouseBonusPoints(houseId);

        // Build chart data
        const labels: string[] = [];
        const data: number[] = [];

        categories.forEach((category) => {
            if (category.key === 'totalPoints') {
                return;
            }
            const points = bonusTotals[category.key] || 0;
            if (points > 0) { // Only show categories with bonus points
                labels.push(`${category.name}: ${points} pts`);
                data.push(points);
            }
        });

        // Check if all data is zero
        const allZero = data.every(value => value === 0) || data.length === 0;

        if (allZero) {
            return null;
        }

        // Generate colors based on house color but with different opacity for distinction
        const backgroundColors = generateHouseColors(houseColorName, labels.length, 0.6);
        const borderColors = generateBorderColors(houseColorName, labels.length);

        return {
            labels,
            datasets: [
                {
                    label: `${houseName} Bonus Points`,
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
                            generateLabels: function (chart) {
                                const data = chart.data;

                                if (
                                    data.labels.length &&
                                    data.datasets.length
                                ) {
                                    return data.labels.map((label, index) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[index];

                                        return {
                                            text: `${label.split(":")[0]}: ${value} pts`,
                                            fillStyle:
                                                dataset.backgroundColor[index],
                                            strokeStyle:
                                                dataset.borderColor[index],
                                            lineWidth: dataset.borderWidth,
                                            hidden: false,
                                            index: index,
                                        };
                                    });
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
        console.error("Error generating bonus chart data:", error);
        return null;
    }
}
