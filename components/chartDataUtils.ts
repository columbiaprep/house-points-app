// Utility functions for generating chart data from Firebase collections

import { collection, getDocs, where, query } from "@firebase/firestore";

import { generateHouseColors, generateBorderColors } from "./chartColorUtils";

import { db } from "@/firebase-configuration/firebaseApp";
import {
    HouseDocument,
    IndividualDocument,
    PointCategory,
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

        // Find the house document by colorName
        const housesQuery = query(
            collection(db, "houses"),
            where("colorName", "==", houseColorName),
        );
        const housesSnapshot = await getDocs(housesQuery);

        let houseData: HouseDocument;

        if (housesSnapshot.empty) {
            // Try finding by document ID if colorName doesn't work
            const allHousesSnapshot = await getDocs(collection(db, "houses"));
            const houseDoc = allHousesSnapshot.docs.find(
                (doc) =>
                    doc.data().colorName === houseColorName ||
                    doc.id === houseColorName,
            );

            if (!houseDoc) {
                throw new Error(`No house found with color: ${houseColorName}`);
            }

            houseData = houseDoc.data() as HouseDocument;
        } else {
            houseData = housesSnapshot.docs[0].data() as HouseDocument;
        }

        // Extract point values for each category
        const labels: string[] = [];
        const data: number[] = [];

        categories.forEach((category) => {
            if (houseData[category.key] && houseData[category.key] > 0) {
                labels.push(category.name);
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
                    borderWidth: 3,
                },
            ],
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
                    borderWidth: 3,
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
            if (studentData[category.key] && studentData[category.key] > 0) {
                labels.push(category.name);
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
                    borderWidth: 3,
                },
            ],
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
                    borderWidth: 3,
                },
            ],
        };
    }
}
