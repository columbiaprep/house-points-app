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
} from "@heroui/react";
import Papa from "papaparse";

import { resetDatabase, Student } from "@/firebase-configuration/firebaseDb";

const AdminReset = () => {
    const [fileContents, setFileContents] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

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
        try {
            const parseResult = Papa.parse(fileContents, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            });

            const headers: string[] = [
                "STUDENT: First Name",
                "STUDENT: Last Name",
                "STUDENT: Email 1",
                "Class",
                "Grade",
            ];
            const students: Array<Student> = parseResult.data.map(
                (row: any) => {
                    return {
                        id: row[headers[2]],
                        name: `${row[headers[0]]} ${row[headers[1]]}`,
                        firstName: row[headers[0]],
                        lastName: row[headers[1]],
                        email: row[headers[2]],
                        house: row[headers[3]],
                        grade: row[headers[4]],
                    };
                },
            );

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
        } catch (error) {
            console.error("Failed to reset all house rosters:", error);
        }
        setLoading(false);
    };

    return (
        <Card className="container mt-4 p-4 bg-background md:w-5/6 w-full">
            <h2 className="text-2xl font-bold text-center">Yearly Reset</h2>
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
                    Import Entire Houses Roster (Should Include: Name, Grade,
                    House, ID)
                </h2>
                <div className="bg-gray-100 p-2 rounded flex flex-col font-sans gap-2">
                    <div className="container">
                        <Input
                            accept=".csv"
                            className="bg-gray-200 p-2 rounded"
                            type="file"
                            onChange={handleFileChange}
                        />
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
        </Card>
    );
};

export default AdminReset;
