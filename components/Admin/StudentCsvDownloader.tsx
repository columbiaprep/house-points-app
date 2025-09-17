"use client";
import { useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { MdDownload } from "react-icons/md";

import { fetchAllIndividuals, getPointCategories } from "@/firebase-configuration/firebaseDb";

const StudentCsvDownloader = () => {
    const [downloading, setDownloading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    const generateCsvContent = async (): Promise<string> => {
        try {
            // Fetch all students and point categories
            const [students, pointCategories] = await Promise.all([
                fetchAllIndividuals(),
                getPointCategories()
            ]);

            // Create CSV headers
            const headers = [
                "Email",
                "Name",
                "Grade",
                "House",
                "House Rank",
                ...pointCategories.map(cat => cat.name),
                "Total Points"
            ];

            // Create CSV rows
            const rows = students.map(student => {
                const totalPoints = pointCategories.reduce(
                    (total, category) => total + (student[category.key] || 0),
                    0
                );

                return [
                    student.id, // Email is the document ID
                    student.name,
                    student.grade,
                    student.house,
                    student.houseRank || 0,
                    ...pointCategories.map(cat => student[cat.key] || 0),
                    totalPoints
                ];
            });

            // Combine headers and rows
            const csvContent = [headers, ...rows]
                .map(row => row.map(field => `"${field}"`).join(","))
                .join("\n");

            return csvContent;
        } catch (error) {
            console.error("Error generating CSV content:", error);
            throw new Error("Failed to generate CSV content");
        }
    };

    const downloadCsv = async () => {
        setDownloading(true);
        setMessage(null);

        try {
            const csvContent = await generateCsvContent();

            // Create blob and download link
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `students_data_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setMessage({
                    text: "CSV file downloaded successfully",
                    type: "success"
                });
            } else {
                throw new Error("Browser does not support file downloads");
            }
        } catch (error) {
            console.error("Error downloading CSV:", error);
            setMessage({
                text: "Error downloading CSV file",
                type: "error"
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className="mt-4">
            <CardBody>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold">Download Student Data</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Export all student data including points breakdown to CSV format
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<MdDownload size={16} />}
                        isLoading={downloading}
                        onPress={downloadCsv}
                    >
                        {downloading ? "Generating..." : "Download CSV"}
                    </Button>
                </div>

                {message && (
                    <Card
                        className={
                            message.type === "error"
                                ? "border-red-500"
                                : "border-green-500"
                        }
                    >
                        <CardBody>
                            <p
                                className={
                                    message.type === "error"
                                        ? "text-red-600"
                                        : "text-green-600"
                                }
                            >
                                {message.text}
                            </p>
                        </CardBody>
                    </Card>
                )}

                <div className="text-sm text-gray-500 mt-4">
                    <p><strong>CSV Format:</strong></p>
                    <p>Email, Name, Grade, House, House Rank, [Point Categories], Total Points</p>
                    <p className="mt-1">
                        <strong>Note:</strong> Uses bulk read operation to efficiently fetch all student data.
                    </p>
                </div>
            </CardBody>
        </Card>
    );
};

export default StudentCsvDownloader;