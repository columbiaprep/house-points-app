"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Select,
    SelectItem,
    Chip,
} from "@heroui/react";

import {
    type HouseDocument,
    type BonusPoint,
    getAllBonusPoints,
    getBonusPointsForHouse,
    fetchAllHouses,
} from "@/firebase-configuration/firebaseDb";
import { toTitleCase } from "@/config/globalFuncs";

const BonusPointsViewer = () => {
    const [housesData, setHousesData] = useState<HouseDocument[]>([]);
    const [selectedHouse, setSelectedHouse] = useState<string>("");
    const [bonusPoints, setBonusPoints] = useState<BonusPoint[]>([]);
    const [allBonusPoints, setAllBonusPoints] = useState<
        Record<string, BonusPoint[]>
    >({});
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"single" | "all">("single");

    useEffect(() => {
        const loadHousesData = async () => {
            try {
                // Load houses data from Firestore instead of Firebase Storage
                const houses = await fetchAllHouses();

                setHousesData(houses);
                if (houses.length > 0) {
                    setSelectedHouse(houses[0].id);
                }
            } catch (error) {
                console.error("Failed to load houses data:", error);
            }
        };

        loadHousesData();
    }, []);

    const loadBonusPoints = async () => {
        setLoading(true);
        try {
            if (viewMode === "single" && selectedHouse) {
                const points = await getBonusPointsForHouse(selectedHouse);

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
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedHouse && viewMode === "single") {
            loadBonusPoints();
        }
    }, [selectedHouse, viewMode]);

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

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                    <h2 className="text-lg font-bold">
                        📋 Bonus Points History
                    </h2>
                    <div className="flex gap-2">
                        <Select
                            size="sm"
                            value={viewMode}
                            onSelectionChange={(key) =>
                                setViewMode(
                                    Array.from(key)[0] as "single" | "all",
                                )
                            }
                        >
                            <SelectItem key="single" value={"single" as any}>
                                Single House
                            </SelectItem>
                            <SelectItem key="all" value={"all" as any}>
                                All Houses
                            </SelectItem>
                        </Select>
                        <Button
                            isLoading={loading}
                            size="sm"
                            variant="flat"
                            onPress={loadBonusPoints}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {viewMode === "single" && (
                    <Select
                        label="Select House"
                        placeholder="Choose a house"
                        value={selectedHouse}
                        onSelectionChange={(value) =>
                            setSelectedHouse(Array.from(value)[0] as string)
                        }
                    >
                        {housesData.map((house) => (
                            <SelectItem key={house.id} value={house.id as any}>
                                {toTitleCase(house.name)}
                            </SelectItem>
                        ))}
                    </Select>
                )}
            </CardHeader>
            <CardBody>
                {viewMode === "single" ? (
                    <Table aria-label="Bonus points table">
                        <TableHeader>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn>CATEGORY</TableColumn>
                            <TableColumn>POINTS</TableColumn>
                            <TableColumn>REASON</TableColumn>
                            <TableColumn>ADDED BY</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No bonus points found">
                            {bonusPoints.map((bp) => (
                                <TableRow key={bp.id}>
                                    <TableCell>
                                        {formatDate(bp.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
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
                                            {bp.points > 0 ? "+" : ""}
                                            {bp.points}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{bp.reason}</TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {bp.addedBy}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(allBonusPoints).map(
                            ([houseId, points]) => (
                                <Card key={houseId} className="border">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center w-full">
                                            <h3 className="font-semibold">
                                                {getHouseName(houseId)}
                                            </h3>
                                            <Chip
                                                color="primary"
                                                variant="flat"
                                            >
                                                Total:{" "}
                                                {getTotalForHouse(houseId)}{" "}
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
                                                            key={bp.id}
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
                                                                    {bp.points}
                                                                </Chip>
                                                            </div>
                                                            <span className="max-w-[200px] truncate">
                                                                {bp.reason}
                                                            </span>
                                                        </div>
                                                    ))
                                            )}
                                            {points.length > 3 && (
                                                <p className="text-xs text-gray-500">
                                                    ...and {points.length - 3}{" "}
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
            </CardBody>
        </Card>
    );
};

export default BonusPointsViewer;
