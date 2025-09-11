"use client";
import { useEffect, useState } from "react";
import {
    Autocomplete,
    AutocompleteItem,
    Select,
    SelectItem,
    Input,
    Button,
    RadioGroup,
    Radio,
} from "@heroui/react";
import { Card, CardBody } from "@heroui/card";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useRouter } from "next/navigation";

import {
    type IndividualDocument,
    type HouseDocument,
    writeToIndividualData,
    writeToHouseData,
} from "@/firebase-configuration/firebaseDb";
import { toTitleCase } from "@/config/globalFuncs";
import { pointsCategories } from "@/firebase-configuration/firebaseDb";
import app from "@/firebase-configuration/firebaseApp";

const AdminPointsForm = () => {
    const [individualData, setIndividualData] = useState<IndividualDocument[]>(
        [],
    );
    const [housesData, setHousesData] = useState<HouseDocument[]>([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedHouse, setSelectedHouse] = useState("");
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const [addBy, setAddBy] = useState("student");
    const [message, setMessage] = useState<{
        text: string;
        type: string;
    } | null>(null);

    const router = useRouter();

    const storage = getStorage(app);
    const loadData = async () => {
        const dataRef = ref(storage, "data.json");

        try {
            const url = await getDownloadURL(dataRef);
            const response = await fetch(url);
            const data = await response.json();

            setIndividualData(data.individuals);
            setHousesData(data.houses);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddStudentPoints = async () => {
        if (!selectedStudent || !selectedCategory) {
            setMessage({
                text: "Please select a student and category.",
                type: "error",
            });

            return;
        }

        try {
            await writeToIndividualData(
                selectedCategory,
                selectedStudent,
                pointsToAdd,
            );

            setMessage({ text: "Points added successfully!", type: "success" });
        } catch (error) {
            setMessage({ text: "Failed to add points.", type: "error" });
            console.error("Failed to add points:", error);
        }
    };

    const handleAddHousePoints = async () => {
        try {
            await writeToHouseData(
                selectedCategory,
                selectedHouse,
                pointsToAdd,
            );

            setMessage({
                text: `Points added successfully!`,
                type: "success",
            });
        } catch (error) {
            setMessage({ text: "Failed to add points.", type: "error" });
            console.error("Failed to add points:", error);
        }
    };

    const handleAddPoints = () => {
        if (addBy === "student") {
            handleAddStudentPoints();
        }
        if (addBy === "house") {
            handleAddHousePoints();
        }
        router.push("/admin");
    };

    return (
        <div className="flex">
            <Card
                isBlurred
                className="point-form-card border-none bg-background/60 dark:bg-default-100/50 shadow-lg p-6 md:w-5/6 w-full"
            >
                <CardBody>
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-center">
                            Add Points
                        </h2>
                        <RadioGroup
                            className="mt-4"
                            defaultValue={"student"}
                            label="Add Points By"
                            onValueChange={setAddBy}
                        >
                            <Radio value="student">Student</Radio>
                            <Radio value="house">House</Radio>
                        </RadioGroup>
                        {addBy === "student" && (
                            <div className="by-student">
                                <h3 className="text-xl font-semibold">
                                    By Student
                                </h3>
                                <Autocomplete
                                    className="w-full"
                                    label="Student Name"
                                    value={selectedStudent}
                                    onSelectionChange={(key) =>
                                        setSelectedStudent(
                                            key ? String(key) : "",
                                        )
                                    } // Update selectedStudent
                                >
                                    {individualData.map(
                                        (student: IndividualDocument) => (
                                            <AutocompleteItem
                                                key={student.id}
                                                id={student.id}
                                            >
                                                {student.name}
                                            </AutocompleteItem>
                                        ),
                                    )}
                                </Autocomplete>
                                <Select
                                    className="w-full mt-4"
                                    label="Select a category"
                                    onSelectionChange={(value) =>
                                        setSelectedCategory(
                                            pointsCategories[
                                                value.currentKey as unknown as number
                                            ].key,
                                        )
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
                                    className="mt-4 w-full"
                                    label="Points to Add"
                                    type="number"
                                    onChange={(e) =>
                                        setPointsToAdd(parseInt(e.target.value))
                                    }
                                />
                            </div>
                        )}
                        {addBy === "house" && (
                            <div className="by-house">
                                <h3 className="text-xl font-semibold">
                                    By House
                                </h3>
                                <Select
                                    className="w-full"
                                    label="Select a House"
                                    value={selectedHouse}
                                    onSelectionChange={(key) => {
                                        const selectedValue =
                                            Array.from(key)[0];

                                        setSelectedHouse(
                                            selectedValue
                                                ? String(selectedValue)
                                                : "",
                                        );
                                    }}
                                >
                                    {housesData.map((house) => (
                                        <SelectItem
                                            key={house.name}
                                            id={house.name}
                                        >
                                            {toTitleCase(house.name)}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    className="w-full mt-4"
                                    label="Select a category"
                                    onSelectionChange={(value) =>
                                        setSelectedCategory(
                                            pointsCategories[
                                                value.currentKey as unknown as number
                                            ].key,
                                        )
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
                                    className="mt-4 w-full"
                                    label="Points to Add"
                                    type="number"
                                    onChange={(e) =>
                                        setPointsToAdd(parseInt(e.target.value))
                                    }
                                />
                            </div>
                        )}
                        <Button
                            className="mt-6 w-full"
                            onPress={handleAddPoints}
                        >
                            Add Points
                        </Button>
                    </div>
                    {message && (
                        <div
                            className={`message ${message.type === "success" ? "text-green-500" : "text-red-500"}`}
                        >
                            {message.text}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default AdminPointsForm;
