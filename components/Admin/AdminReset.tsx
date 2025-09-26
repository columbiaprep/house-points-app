import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import React, { useState } from "react";
import { Spinner } from "@heroui/spinner";
import {
    Modal,
    ModalContent,
    useDisclosure,
    ModalFooter,
    ModalHeader,
    ModalBody,
    Card,
    CardBody,
} from "@heroui/react";
import Papa from "papaparse";

import { resetDatabase, Student } from "@/firebase-configuration/firebaseDb";

const AdminReset = () => {
    const [fileContents, setFileContents] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [validationMessage, setValidationMessage] = useState<string>("");
    const [isSuccess, setIsSuccess] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        // Clear previous validation messages
        setValidationMessage("");
        setIsSuccess(false);

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target?.result as string;

                setFileContents(content);
            };
            reader.readAsText(file);
        }
    };

    const handleFullReset = async () => {
        setLoading(true);
        setValidationMessage("");
        setIsSuccess(false);

        try {
            const parseResult = Papa.parse(fileContents, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            const expectedHeaders = ["Name", "Grade", "House", "Email"];
            const actualHeaders = parseResult.meta.fields || [];

            // Validate headers
            const missingHeaders = expectedHeaders.filter(header => !actualHeaders.includes(header));
            if (missingHeaders.length > 0) {
                setValidationMessage(`Missing required headers: ${missingHeaders.join(", ")}. Expected headers: ${expectedHeaders.join(", ")}`);
                setLoading(false);
                return;
            }
            const students: Array<Student> = parseResult.data
                .map((row: any) => {
                    const fullName = row[expectedHeaders[0]] || "";
                    const email = row[expectedHeaders[3]];
                    const house = row[expectedHeaders[2]];
                    const grade = row[expectedHeaders[1]];

                    // Validate required fields
                    if (!email || !fullName || !house || grade === undefined) {
                        console.warn("Skipping invalid student row:", row);
                        return null;
                    }

                    // Sanitize email for use as Firestore document ID
                    const sanitizedId = email.trim().toLowerCase();

                    return {
                        id: sanitizedId,
                        name: fullName,
                        house: house,
                        grade: grade,
                    };
                })
                .filter((student): student is Student => student !== null);

            students.forEach((student) => {
                if (student.house.includes("Green")) {
                    student.house = "Green Ivy";
                }
                if (student.house.includes("Red")) {
                    student.house = "Red Phoenix";
                }
                if (student.house.includes("Blue")) {
                    student.house = "Blue Thunder";
                }
                if (student.house.includes("Gold")) {
                    student.house = "Gold Hearts";
                }
                if (student.house.includes("Orange")) {
                    student.house = "Orange Supernova";
                }
                if (student.house.includes("Purple")) {
                    student.house = "Purple Reign";
                }
                if (student.house.includes("Silver")) {
                    student.house = "Silver Knights";
                }
                if (student.house.includes("Pink")) {
                    student.house = "Pink Panthers";
                }
            });

            await resetDatabase(students);

            // Success - show success message and auto-close modal
            setIsSuccess(true);
            setValidationMessage(`Successfully reset database with ${students.length} students`);
            setTimeout(() => {
                onClose();
                setValidationMessage("");
                setIsSuccess(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to reset all house rosters:", error);
            setValidationMessage("Failed to reset database. Please check the console for details.");
        }
        setLoading(false);
    };

    return (
        <Card className="border-red-200 bg-red-50">
            <CardBody>
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-red-700">
                        ⚠️ Database Reset
                    </h2>
                    <p className="text-sm text-red-600">
                        Dangerous operation - Resets all student points and
                        updates house rosters
                    </p>
                </div>
                <div>
                    <Modal
                        isOpen={isOpen}
                        title="Reset All House Rosters"
                        onClose={onClose}
                    >
                        <ModalContent>
                            <ModalHeader>Reset All House Rosters</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to reset all house
                                    rosters?
                                </p>
                                <p>This action cannot be undone.</p>
                                {validationMessage && (
                                    <div className={`mt-4 p-3 rounded ${isSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                        {validationMessage}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    disabled={loading}
                                    onPress={handleFullReset}
                                >
                                    {loading ? <Spinner /> : "Reset All"}
                                </Button>
                                <Button onPress={onClose}>Cancel</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                    <h2 className="text-center p-4">
                        Import Entire Houses Roster (Should Include: Name,
                        Grade, House, Email)
                    </h2>
                    <div className="bg-gray-100 p-2 rounded flex flex-col font-sans gap-2">
                        <div className="container">
                            <Input
                                accept=".csv"
                                className="bg-gray-200 p-2 rounded"
                                type="file"
                                onChange={handleFileChange}
                            />
                            {validationMessage && !isOpen && (
                                <div className={`mt-4 p-3 rounded ${isSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                                    {validationMessage}
                                </div>
                            )}
                            {fileContents && (
                                <Button className="mt-4" onPress={onOpen}>
                                    Reset All
                                </Button>
                            )}
                        </div>
                        {fileContents && (
                            <div className="mt-4 bg-white p-4 rounded shadow">
                                <h3 className="text-lg font-semibold">
                                    File Contents:
                                </h3>
                                <div className="whitespace-pre-wrap">
                                    {fileContents}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default AdminReset;
