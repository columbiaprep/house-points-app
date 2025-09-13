"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
} from "@heroui/react";
import { getDownloadURL, getStorage, ref } from "firebase/storage";

import {
    type HouseDocument,
    type PointCategory,
    addBonusPointToHouse,
} from "@/firebase-configuration/firebaseDb";
import { toTitleCase } from "@/config/globalFuncs";
import { getCachedPointCategories } from "@/firebase-configuration/cachedFirebaseDb";
import app from "@/firebase-configuration/firebaseApp";
import { useAuth } from "@/contexts/AuthContext";

const AdminHousePoints = () => {
    const auth = useAuth();
    const [housesData, setHousesData] = useState<HouseDocument[]>([]);
    const [pointsCategories, setPointsCategories] = useState<PointCategory[]>(
        [],
    );
    const [selectedHouse, setSelectedHouse] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    const storage = getStorage(app);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load houses data
                const dataRef = ref(storage, "data.json");
                const url = await getDownloadURL(dataRef);
                const response = await fetch(url);
                const data = await response.json();

                setHousesData(data.houses);

                // Load point categories
                const categories = await getCachedPointCategories();

                setPointsCategories(categories);
            } catch (error) {
                console.error("Failed to load data:", error);
                setMessage({
                    text: "Error loading data",
                    type: "error",
                });
            }
        };

        loadData();
    }, []);

    const handleAddHousePoints = async () => {
        if (
            !selectedHouse ||
            !selectedCategory ||
            pointsToAdd === 0 ||
            !reason.trim()
        ) {
            setMessage({
                text: "Please select a house, category, enter points, and provide a reason",
                type: "error",
            });

            return;
        }

        if (!auth.user?.email) {
            setMessage({
                text: "Authentication required",
                type: "error",
            });

            return;
        }

        setLoading(true);
        try {
            await addBonusPointToHouse(
                selectedHouse,
                selectedCategory,
                pointsToAdd,
                reason,
                auth.user.email,
            );
            setMessage({
                text: `Successfully added ${pointsToAdd} bonus points to ${selectedHouse}`,
                type: "success",
            });
            // Reset form
            setSelectedHouse("");
            setSelectedCategory("");
            setPointsToAdd(0);
            setReason("");
        } catch (error) {
            console.error("Error adding house bonus points:", error);
            setMessage({
                text: "Error adding bonus points to house",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mt-4">
            <CardBody>
                <div className="flex flex-col gap-4">
                    <div className="text-center">
                        <h2 className="text-lg font-bold">
                            🏆 House Bonus Points
                        </h2>
                        <p className="text-sm text-gray-600">
                            Add bonus points to houses with tracking
                        </p>
                    </div>

                    <Select
                        label="Select House"
                        placeholder="Choose a house"
                        value={selectedHouse}
                        onSelectionChange={(value) =>
                            setSelectedHouse(Array.from(value)[0] as string)
                        }
                    >
                        {housesData.map((house) => (
                            <SelectItem key={house.id} value={house.id}>
                                {toTitleCase(house.name)}
                            </SelectItem>
                        ))}
                    </Select>

                    <Select
                        label="Select Category"
                        placeholder="Choose point category"
                        value={selectedCategory}
                        onSelectionChange={(value) =>
                            setSelectedCategory(Array.from(value)[0] as string)
                        }
                    >
                        {pointsCategories.map((category) => (
                            <SelectItem key={category.key} value={category.key}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </Select>

                    <Input
                        label="Reason"
                        placeholder="Explain why these bonus points are being awarded"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />

                    <Input
                        label="Points to Add"
                        placeholder="Enter point amount"
                        type="number"
                        value={pointsToAdd.toString()}
                        onChange={(e) =>
                            setPointsToAdd(parseInt(e.target.value) || 0)
                        }
                    />

                    <Button
                        color="primary"
                        isLoading={loading}
                        onPress={handleAddHousePoints}
                    >
                        Add Bonus Points
                    </Button>

                    {message && (
                        <div
                            className={`text-center text-sm ${
                                message.type === "success"
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default AdminHousePoints;
