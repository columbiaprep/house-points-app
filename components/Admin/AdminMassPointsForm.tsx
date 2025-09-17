import {
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
} from "@heroui/react";
import { useState } from "react";

import { pointsCategories, fetchIndividual } from "@/firebase-configuration/firebaseDb";
import { batchWritePoints, PointUpdate } from "@/firebase-configuration/cachedFirebaseDb";

const AdminMassPointsForm = () => {
    const [fileContents, setFileContents] = useState<string>("");
    const [points, setPoints] = useState<number>(0);
    const [category, setCategory] = useState<string>("");

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

    const handleSubmission = async () => {
        const studentIds = fileContents.split("\n").map((line) => line.trim()).filter(id => id.length > 0);

        try {
            // Get house for each student and create batch updates
            const updates: PointUpdate[] = [];

            for (const studentId of studentIds) {
                try {
                    const individual = await fetchIndividual(studentId);
                    updates.push({
                        studentId,
                        house: individual.house,
                        category,
                        points
                    });
                } catch (error) {
                    console.error(`Error fetching student ${studentId}:`, error);
                }
            }

            // Batch update all students and houses at once
            const result = await batchWritePoints(updates);

            if (result.success) {
                alert(`Successfully updated ${result.studentsUpdated} students and ${result.housesUpdated} houses`);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Error in mass points submission:", error);
            alert("Error processing mass points submission");
        }
    };

    return (
        <div className="flex">
            <Card
                isBlurred
                className="point-form-card border-none shadow-lg p-6  h-full md:w-5/6 w-full"
            >
                <CardBody>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-center">
                            Import A Roster of Students & Value of Points to Add
                        </h2>
                        <p className="text-center">
                            File must have only Student IDs
                        </p>
                        <Input
                            required
                            accept=".csv"
                            className="p-2 rounded"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <Select
                            className="p-2 rounded"
                            label="Select a category"
                            onSelectionChange={(value) =>
                                setCategory(value.currentKey as string)
                            }
                        >
                            {Object.entries(pointsCategories).map(
                                ([key, value]) => (
                                    <SelectItem key={key} id={key}>
                                        {value.name}
                                    </SelectItem>
                                ),
                            )}
                        </Select>
                        <Input
                            required
                            className="p-2 rounded"
                            placeholder="Points to Add"
                            type="number"
                            onChange={(e) =>
                                setPoints(parseInt(e.target.value))
                            }
                        />
                        <Button onPress={handleSubmission}>Add Points</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AdminMassPointsForm;
