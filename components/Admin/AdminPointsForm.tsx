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
} from "@nextui-org/react";
import { Card, CardBody } from "@nextui-org/card";

import {
    type IndividualDocument,
    type HouseDocument,
    writeToIndividualData,
    writeToHouseData,
    fetchAllHouses,
    fetchAllIndividuals,
} from "@/firebase-configuration/firebaseDb";
import { toTitleCase } from "@/config/globalFuncs";
import { pointsCategories } from "@/firebase-configuration/pointsCategoriesConfig";

const getAllIndividualData = async (): Promise<IndividualDocument[] | null> => {
    try {
        const data = await fetchAllIndividuals();

        return data;
    } catch (error) {
        console.error("Failed to fetch individual data:", error);

        return null;
    }
};

const getAllHousesLeaderboardData = async (): Promise<
    HouseDocument[] | null
> => {
    try {
        const data = await fetchAllHouses();

        return data;
    } catch (error) {
        console.error("Failed to fetch houses leaderboard data:", error);

        return null;
    }
};

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

    useEffect(() => {
        const fetchIndividualData = async () => {
            const data = await getAllIndividualData();

            if (data) {
                setIndividualData(data);
            }
        };
        const fetchHousesData = async () => {
            const data = await getAllHousesLeaderboardData();

            if (data) {
                setHousesData(data);
            }
        };
        const fetchData = async () => {
            await fetchHousesData();
            await fetchIndividualData();
        };

        fetchData();
    }, []);

    const handleAddStudentPoints = async () => {
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

            setMessage({ text: "Points added successfully!", type: "success" });
        } catch (error) {
            setMessage({ text: "Failed to add points.", type: "error" });
            console.error("Failed to add points:", error);
        }
        setSelectedStudent("");
        setSelectedHouse("");
        setPointsToAdd(0);
    };

    const handleAddPoints = () => {
        if (addBy === "student") {
            handleAddStudentPoints();
        }
        if (addBy === "house") {
            handleAddHousePoints();
        }
    };

    return (
        <div className="flex">
            <Card
                isBlurred
                className="point-form-card border-none bg-background/60 dark:bg-default-100/50 shadow-lg p-6 w-5/6"
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
                                    onSelectionChange={(value) =>
                                        setSelectedStudent(value as string)
                                    }
                                >
                                    {individualData.map((student) => (
                                        <AutocompleteItem
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.name}
                                        </AutocompleteItem>
                                    ))}
                                </Autocomplete>
                                <Select
                                    className="w-full mt-4"
                                    label="Select a category"
                                    onSelectionChange={(value) =>
                                        setSelectedCategory(
                                            value.currentKey as string,
                                        )
                                    }
                                >
                                    {Object.entries(pointsCategories).map(
                                        ([key, value]) => (
                                            <SelectItem key={key} value={key}>
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
                                    onChange={(e) =>
                                        setSelectedHouse(e.target.value)
                                    }
                                >
                                    {housesData.map((house) => (
                                        <SelectItem
                                            key={house.id}
                                            textValue={toTitleCase(house.name)}
                                            value={house.id}
                                        >
                                            {toTitleCase(house.name)} House
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    className="w-full mt-4"
                                    label="Select a category"
                                    onSelectionChange={(value) =>
                                        setSelectedCategory(
                                            value.currentKey as string,
                                        )
                                    }
                                >
                                    {Object.entries(pointsCategories).map(
                                        ([key, value]) => (
                                            <SelectItem key={key} value={key}>
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
