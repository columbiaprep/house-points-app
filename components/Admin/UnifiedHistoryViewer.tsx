"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    Select,
    SelectItem,
    Button,
    Input,
    Chip,
    Tabs,
    Tab,
    Autocomplete,
    AutocompleteItem,
} from "@heroui/react";

import {
    type PointEvent,
    type BonusPoint,
    getAllPointEvents,
    getPointEventsForStudent,
    getPointEventsForHouse,
    getAllBonusPoints,
    getBonusPointsForHouse,
    fetchAllIndividuals,
    fetchAllHouses,
    deletePointEvent,
    deleteBonusPoint,
    type IndividualDocument,
    type HouseDocument,
} from "@/firebase-configuration/firebaseDb";

// Combined interface for unified display
interface UnifiedHistoryEntry {
    id: string;
    type: 'point' | 'bonus';
    timestamp: Date;
    studentId?: string;
    studentName?: string;
    house: string;
    category: string;
    points: number;
    addedBy: string;
    reason?: string;
    eventType?: string;
    batchId?: string;
}

const UnifiedHistoryViewer = () => {
    const [entries, setEntries] = useState<UnifiedHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedHouse, setSelectedHouse] = useState("");
    const [limit, setLimit] = useState(10);
    const [students, setStudents] = useState<IndividualDocument[]>([]);
    const [houses, setHouses] = useState<HouseDocument[]>([]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [studentsData, housesData] = await Promise.all([
                fetchAllIndividuals(),
                fetchAllHouses(),
            ]);
            setStudents(studentsData);
            setHouses(housesData);
            await loadHistory();
        } catch (error) {
            console.error("Failed to load initial data:", error);
        }
    };

    const loadHistory = async () => {
        setLoading(true);
        try {
            let pointEvents: PointEvent[] = [];
            let bonusPoints: Record<string, BonusPoint[]> = {};

            // Load point events based on filter
            if (filter === "all") {
                pointEvents = await getAllPointEvents(limit);
                bonusPoints = await getAllBonusPoints();
                console.log(`Loaded ${pointEvents.length} point events (limit: ${limit})`);
            } else if (filter === "student" && selectedStudent) {
                pointEvents = await getPointEventsForStudent(selectedStudent, limit);
                console.log(`Loaded ${pointEvents.length} point events for student ${selectedStudent}`);
            } else if (filter === "house" && selectedHouse) {
                // selectedHouse is now the house name directly
                const houseName = selectedHouse;

                // Find the house ID for bonus points lookup
                const selectedHouseData = houses.find(h => h.name === selectedHouse);
                const houseId = selectedHouseData?.id || selectedHouse;

                pointEvents = await getPointEventsForHouse(houseName, limit);
                const houseBonusPoints = await getBonusPointsForHouse(houseId);
                bonusPoints[houseName] = houseBonusPoints;
                console.log(`Loaded ${pointEvents.length} point events for house ${houseName} (ID: ${houseId})`);
            }

            // Convert to unified format
            const unifiedEntries: UnifiedHistoryEntry[] = [];

            // Add point events (excluding legacy summary events)
            pointEvents.forEach(event => {
                // Skip legacy BULK_OPERATION summary events - we now have individual events
                if (event.studentId === 'BULK_OPERATION') {
                    return;
                }

                unifiedEntries.push({
                    id: event.id,
                    type: 'point',
                    timestamp: event.timestamp,
                    studentId: event.studentId,
                    studentName: event.studentName,
                    house: event.house,
                    category: event.category,
                    points: event.points,
                    addedBy: event.addedBy,
                    eventType: event.type,
                    batchId: event.batchId,
                });
            });

            // Add bonus points
            Object.entries(bonusPoints).forEach(([houseName, houseBonus]) => {
                houseBonus.forEach(bonus => {
                    unifiedEntries.push({
                        id: bonus.id,
                        type: 'bonus',
                        timestamp: bonus.timestamp,
                        house: houseName,
                        category: bonus.category,
                        points: bonus.points,
                        addedBy: bonus.addedBy,
                        reason: bonus.reason,
                    });
                });
            });

            // Sort by timestamp (newest first)
            unifiedEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            console.log(`Total unified entries before limiting: ${unifiedEntries.length}`);
            console.log('Recent entries:', unifiedEntries.slice(0, 10).map(e => ({
                type: e.type,
                studentName: e.studentName,
                house: e.house,
                category: e.category,
                points: e.points,
                timestamp: e.timestamp.toISOString(),
                eventType: e.eventType,
                batchId: e.batchId
            })));

            // Limit results if needed
            const finalEntries = unifiedEntries.slice(0, limit);
            console.log(`Final entries count: ${finalEntries.length}`);
            setEntries(finalEntries);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (entry: UnifiedHistoryEntry) => {
        const entryKey = `${entry.type}-${entry.id}`;
        setDeleteLoading(entryKey);
        setMessage(null);

        try {
            if (entry.type === 'point') {
                await deletePointEvent(entry.id);
                setMessage({
                    text: `Successfully deleted point event for ${entry.studentName}`,
                    type: 'success'
                });
            } else if (entry.type === 'bonus') {
                await deleteBonusPoint(entry.house, entry.id);
                setMessage({
                    text: `Successfully deleted bonus points for ${entry.house}`,
                    type: 'success'
                });
            }

            // Reload the data
            await loadHistory();
        } catch (error) {
            console.error("Failed to delete entry:", error);
            setMessage({
                text: error instanceof Error ? error.message : "Failed to delete entry",
                type: 'error'
            });
        } finally {
            setDeleteLoading(null);
        }
    };

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const getTypeChip = (entry: UnifiedHistoryEntry) => {
        if (entry.type === 'bonus') {
            return (
                <Chip size="sm" color="secondary" variant="flat">
                    House Bonus
                </Chip>
            );
        } else if (entry.eventType === 'bulk' || entry.eventType === 'csv') {
            return (
                <Chip size="sm" color="warning" variant="flat">
                    {entry.eventType === 'csv' ? 'CSV' : 'Bulk'}
                </Chip>
            );
        } else {
            return (
                <Chip size="sm" color="primary" variant="flat">
                    Individual
                </Chip>
            );
        }
    };

    return (
        <Card className="w-full">
            <CardBody>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">📊 Points & Bonus History</h3>
                        <Button
                            color="primary"
                            size="sm"
                            onPress={loadHistory}
                            isLoading={loading}
                        >
                            Refresh
                        </Button>
                    </div>

                    {message && (
                        <div
                            className={`text-center text-sm p-2 rounded ${
                                message.type === "success"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <Select
                            label="Filter Type"
                            size="sm"
                            className="w-32"
                            selectedKeys={filter ? [filter] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                setFilter(selected || "all");
                            }}
                        >
                            <SelectItem key="all" value="all">
                                All Entries
                            </SelectItem>
                            <SelectItem key="student" value="student">
                                By Student
                            </SelectItem>
                            <SelectItem key="house" value="house">
                                By House
                            </SelectItem>
                        </Select>

                        {filter === "student" && (
                            <Autocomplete
                                label="Search Student"
                                size="sm"
                                className="w-48"
                                placeholder="Type to search students..."
                                selectedKey={selectedStudent}
                                onSelectionChange={(key) => {
                                    setSelectedStudent(key as string || "");
                                }}
                                allowsCustomValue={false}
                                defaultItems={students}
                            >
                                {(student) => (
                                    <AutocompleteItem key={student.id} textValue={`${student.name} (${student.id})`}>
                                        {student.name} ({student.id})
                                    </AutocompleteItem>
                                )}
                            </Autocomplete>
                        )}

                        {filter === "house" && (
                            <Select
                                label="Select House"
                                size="sm"
                                className="w-32"
                                selectedKeys={selectedHouse ? [selectedHouse] : []}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;
                                    setSelectedHouse(selected || "");
                                }}
                            >
                                {houses.map((house) => (
                                    <SelectItem key={house.name} value={house.name}>
                                        {house.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        )}

                        <Select
                            label="Limit"
                            size="sm"
                            className="w-20"
                            selectedKeys={[limit.toString()]}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                setLimit(selected === "all" ? 9999 : parseInt(selected));
                            }}
                        >
                            <SelectItem key="10" value="10">
                                10
                            </SelectItem>
                            <SelectItem key="50" value="50">
                                50
                            </SelectItem>
                            <SelectItem key="all" value="all">
                                All
                            </SelectItem>
                        </Select>

                        <Button
                            size="sm"
                            variant="flat"
                            onPress={loadHistory}
                            isLoading={loading}
                        >
                            Apply Filters
                        </Button>
                    </div>

                    {/* Results Table */}
                    <Table aria-label="Unified points and bonus history">
                        <TableHeader>
                            <TableColumn>DATE</TableColumn>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>STUDENT/HOUSE</TableColumn>
                            <TableColumn>CATEGORY</TableColumn>
                            <TableColumn>POINTS</TableColumn>
                            <TableColumn>REASON/TYPE</TableColumn>
                            <TableColumn>ADDED BY</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No entries found">
                            {entries.map((entry) => (
                                <TableRow key={`${entry.type}-${entry.id}`}>
                                    <TableCell className="text-sm">
                                        {formatDate(entry.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        {getTypeChip(entry)}
                                    </TableCell>
                                    <TableCell>
                                        {entry.type === 'bonus' ? (
                                            <Chip size="sm" color="secondary" variant="flat">
                                                🏆 {entry.house}
                                            </Chip>
                                        ) : entry.studentId === 'BULK_OPERATION' ? (
                                            <Chip size="sm" color="warning" variant="flat">
                                                📊 {entry.studentName}
                                            </Chip>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{entry.studentName}</span>
                                                <span className="text-xs text-gray-500">{entry.house}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
                                            {entry.category}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            color={entry.points > 0 ? "success" : "danger"}
                                            size="sm"
                                        >
                                            {entry.points > 0 ? "+" : ""}{entry.points}
                                        </Chip>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {entry.reason || entry.eventType || "Individual"}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-600">
                                        {entry.addedBy}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            isLoading={deleteLoading === `${entry.type}-${entry.id}`}
                                            isDisabled={
                                                deleteLoading !== null ||
                                                (entry.type === 'point' && (entry.eventType === 'bulk' || entry.eventType === 'csv'))
                                            }
                                            onPress={() => handleDelete(entry)}
                                        >
                                            {entry.type === 'point' && (entry.eventType === 'bulk' || entry.eventType === 'csv')
                                                ? 'Bulk*' : 'Delete'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="text-sm text-gray-500 text-center space-y-1">
                        <div>Showing {entries.length} of latest entries</div>
                        <div className="text-xs">
                            * Bulk/CSV operations cannot be deleted individually for safety. Use the batch rollback feature to reverse specific uploads, or database reset for complete cleanup.
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default UnifiedHistoryViewer;