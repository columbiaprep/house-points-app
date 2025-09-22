"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tabs,
    Tab,
} from "@heroui/react";

import {
    type HouseDocument,
    type PointCategory,
    type BonusPoint,
    addBonusPointToHouse,
    getAllBonusPoints,
    getBonusPointsForHouse,
    deleteBonusPoint,
    fetchAllHouses,
} from "@/firebase-configuration/firebaseDb";
import { toTitleCase } from "@/config/globalFuncs";
import { getCachedPointCategories } from "@/firebase-configuration/cachedFirebaseDb";
import { useAuth } from "@/contexts/AuthContext";

const HouseBonusPointsManager = () => {
    const auth = useAuth();
    const [housesData, setHousesData] = useState<HouseDocument[]>([]);
    const [pointsCategories, setPointsCategories] = useState<PointCategory[]>(
        [],
    );

    // Form state
    const [selectedHouse, setSelectedHouse] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [pointsToAdd, setPointsToAdd] = useState(0);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    // Viewer state
    const [viewerSelectedHouse, setViewerSelectedHouse] = useState<string>("");
    const [bonusPoints, setBonusPoints] = useState<BonusPoint[]>([]);
    const [allBonusPoints, setAllBonusPoints] = useState<
        Record<string, BonusPoint[]>
    >({});
    const [viewerLoading, setViewerLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"single" | "all">("single");

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load houses data from Firestore instead of Firebase Storage
                console.log("Loading houses from Firestore...");
                const houses = await fetchAllHouses();
                console.log("Loaded houses:", houses);

                setHousesData(houses);
                if (houses.length > 0) {
                    setViewerSelectedHouse(houses[0].id);
                }

                // Load point categories
                const categories = await getCachedPointCategories();
                console.log("Loaded categories:", categories);

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
            console.log("Adding bonus points with:", {
                selectedHouse,
                selectedCategory,
                pointsToAdd,
                reason,
                addedBy: auth.user.email
            });

            await addBonusPointToHouse(
                selectedHouse,
                selectedCategory,
                pointsToAdd,
                reason,
                auth.user.email,
            );
            const houseName = getHouseName(selectedHouse);

            setMessage({
                text: `Successfully added ${pointsToAdd} bonus points to ${houseName}`,
                type: "success",
            });
            // Reset form
            setSelectedHouse("");
            setSelectedCategory("");
            setPointsToAdd(0);
            setReason("");

            // Refresh bonus points data if viewing the same house
            if (viewerSelectedHouse === selectedHouse) {
                loadBonusPoints();
            }
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

    const loadBonusPoints = async () => {
        setViewerLoading(true);
        try {
            if (viewMode === "single" && viewerSelectedHouse) {
                const points =
                    await getBonusPointsForHouse(viewerSelectedHouse);

                setBonusPoints(
                    points.sort(
                        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
                    ),
                );
            } else if (viewMode === "all") {
                const allPoints = await getAllBonusPoints();

                setAllBonusPoints(allPoints);
            }
        } catch (error) {
            console.error("Failed to load bonus points:", error);
        } finally {
            setViewerLoading(false);
        }
    };

    useEffect(() => {
        if (viewerSelectedHouse && viewMode === "single") {
            loadBonusPoints();
        }
    }, [viewerSelectedHouse, viewMode]);

    const formatDate = (date: Date) => {
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getHouseName = (houseId: string) => {
        const house = housesData.find((h) => h.id === houseId);

        return house ? toTitleCase(house.name) : houseId;
    };

    const getTotalForHouse = (houseId: string) => {
        const points = allBonusPoints[houseId] || [];

        return points.reduce((total, bp) => total + bp.points, 0);
    };

    const handleDeleteBonusPoint = async (bonusPoint: BonusPoint) => {
        const houseName = getHouseName(viewerSelectedHouse);

        if (
            !confirm(
                `Are you sure you want to delete this bonus point?\n\nHouse: ${houseName}\nCategory: ${bonusPoint.category}\nPoints: ${bonusPoint.points}\nReason: ${bonusPoint.reason}`,
            )
        ) {
            return;
        }

        setViewerLoading(true);
        try {
            await deleteBonusPoint(viewerSelectedHouse, bonusPoint.id);

            // Refresh the bonus points data
            await loadBonusPoints();

            setMessage({
                text: `Successfully deleted bonus point entry`,
                type: "success",
            });
        } catch (error) {
            console.error("Error deleting bonus point:", error);
            setMessage({
                text: "Error deleting bonus point",
                type: "error",
            });
        } finally {
            setViewerLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <h2 className="text-xl font-bold">
                    🏆 House Bonus Points Management
                </h2>
            </CardHeader>
            <CardBody>
                <Tabs aria-label="Bonus Points Management">
                    <Tab key="add" title="➕ Add Bonus Points">
                        <div className="flex flex-col gap-4 pt-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Add bonus points to houses with tracking
                                </p>
                            </div>

                            <Select
                                label="Select House"
                                placeholder="Choose a house"
                                selectedKeys={selectedHouse ? [selectedHouse] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    console.log("Selected house:", selected);
                                    setSelectedHouse(selected || "");
                                }}
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
                                selectedKeys={selectedCategory ? [selectedCategory] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    console.log("Selected category:", selected);
                                    setSelectedCategory(selected || "");
                                }}
                            >
                                {pointsCategories.map((category) => (
                                    <SelectItem
                                        key={category.key}
                                        value={category.key}
                                    >
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
                                    setPointsToAdd(
                                        parseInt(e.target.value) || 0,
                                    )
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
                    </Tab>

                    <Tab key="history" title="📋 View History">
                        <div className="pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2">
                                    <Select
                                        size="sm"
                                        selectedKeys={viewMode ? [viewMode] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as "single" | "all";
                                            setViewMode(selected || "single");
                                        }}
                                    >
                                        <SelectItem key="single" value="single">
                                            Single House
                                        </SelectItem>
                                        <SelectItem key="all" value="all">
                                            All Houses
                                        </SelectItem>
                                    </Select>
                                    <Button
                                        isLoading={viewerLoading}
                                        size="sm"
                                        variant="flat"
                                        onPress={loadBonusPoints}
                                    >
                                        Refresh
                                    </Button>
                                </div>
                            </div>

                            {viewMode === "single" && (
                                <div className="mb-4">
                                    <Select
                                        label="Select House"
                                        placeholder="Choose a house"
                                        selectedKeys={viewerSelectedHouse ? [viewerSelectedHouse] : []}
                                        onSelectionChange={(keys) => {
                                            const selected = Array.from(keys)[0] as string;
                                            setViewerSelectedHouse(selected || "");
                                        }}
                                    >
                                        {housesData.map((house) => (
                                            <SelectItem
                                                key={house.id}
                                                value={house.id}
                                            >
                                                {toTitleCase(house.name)}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {viewMode === "single" ? (
                                <Table aria-label="Bonus points table">
                                    <TableHeader>
                                        <TableColumn>DATE</TableColumn>
                                        <TableColumn>CATEGORY</TableColumn>
                                        <TableColumn>POINTS</TableColumn>
                                        <TableColumn>REASON</TableColumn>
                                        <TableColumn>ADDED BY</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No bonus points found">
                                        {bonusPoints.map((bp) => (
                                            <TableRow key={bp.id}>
                                                <TableCell>
                                                    {formatDate(bp.timestamp)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {bp.category}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        color={
                                                            bp.points > 0
                                                                ? "success"
                                                                : "danger"
                                                        }
                                                        size="sm"
                                                    >
                                                        {bp.points > 0
                                                            ? "+"
                                                            : ""}
                                                        {bp.points}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {bp.reason}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {bp.addedBy}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        color="danger"
                                                        isLoading={
                                                            viewerLoading
                                                        }
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() =>
                                                            handleDeleteBonusPoint(
                                                                bp,
                                                            )
                                                        }
                                                    >
                                                        🗑️ Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(allBonusPoints).map(
                                        ([houseId, points]) => (
                                            <Card
                                                key={houseId}
                                                className="border"
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-center w-full">
                                                        <h3 className="font-semibold">
                                                            {getHouseName(
                                                                houseId,
                                                            )}
                                                        </h3>
                                                        <Chip
                                                            color="primary"
                                                            variant="flat"
                                                        >
                                                            Total:{" "}
                                                            {getTotalForHouse(
                                                                houseId,
                                                            )}{" "}
                                                            points
                                                        </Chip>
                                                    </div>
                                                </CardHeader>
                                                <CardBody className="pt-0">
                                                    <div className="space-y-2">
                                                        {points.length === 0 ? (
                                                            <p className="text-sm text-gray-500">
                                                                No bonus points
                                                            </p>
                                                        ) : (
                                                            points
                                                                .sort(
                                                                    (a, b) =>
                                                                        b.timestamp.getTime() -
                                                                        a.timestamp.getTime(),
                                                                )
                                                                .slice(0, 3)
                                                                .map((bp) => (
                                                                    <div
                                                                        key={
                                                                            bp.id
                                                                        }
                                                                        className="flex justify-between items-center text-sm"
                                                                    >
                                                                        <span>
                                                                            {formatDate(
                                                                                bp.timestamp,
                                                                            )}
                                                                        </span>
                                                                        <div className="flex gap-2">
                                                                            <Chip
                                                                                size="sm"
                                                                                variant="flat"
                                                                            >
                                                                                {
                                                                                    bp.category
                                                                                }
                                                                            </Chip>
                                                                            <Chip
                                                                                color={
                                                                                    bp.points >
                                                                                    0
                                                                                        ? "success"
                                                                                        : "danger"
                                                                                }
                                                                                size="sm"
                                                                            >
                                                                                {bp.points >
                                                                                0
                                                                                    ? "+"
                                                                                    : ""}
                                                                                {
                                                                                    bp.points
                                                                                }
                                                                            </Chip>
                                                                        </div>
                                                                        <span className="max-w-[200px] truncate">
                                                                            {
                                                                                bp.reason
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ))
                                                        )}
                                                        {points.length > 3 && (
                                                            <p className="text-xs text-gray-500">
                                                                ...and{" "}
                                                                {points.length -
                                                                    3}{" "}
                                                                more
                                                            </p>
                                                        )}
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </CardBody>
        </Card>
    );
};

export default HouseBonusPointsManager;
