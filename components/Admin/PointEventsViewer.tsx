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
} from "@heroui/react";

import {
    type PointEvent,
    getAllPointEvents,
    getPointEventsForStudent,
    getPointEventsForHouse,
    fetchAllIndividuals,
    fetchAllHouses,
    type IndividualDocument,
    type HouseDocument,
} from "@/firebase-configuration/firebaseDb";

const PointEventsViewer = () => {
    const [events, setEvents] = useState<PointEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedHouse, setSelectedHouse] = useState("");
    const [limit, setLimit] = useState(50);
    const [students, setStudents] = useState<IndividualDocument[]>([]);
    const [houses, setHouses] = useState<HouseDocument[]>([]);

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
            loadEvents();
        } catch (error) {
            console.error("Failed to load initial data:", error);
        }
    };

    const loadEvents = async () => {
        setLoading(true);
        try {
            let eventData: PointEvent[] = [];

            if (filter === "student" && selectedStudent) {
                eventData = await getPointEventsForStudent(
                    selectedStudent,
                    limit,
                );
            } else if (filter === "house" && selectedHouse) {
                eventData = await getPointEventsForHouse(selectedHouse, limit);
            } else {
                eventData = await getAllPointEvents(limit);
            }

            setEvents(eventData);
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        return new Date(timestamp).toLocaleString();
    };

    const getPointsChipColor = (points: number) => {
        if (points > 0) return "success";
        if (points < 0) return "danger";

        return "default";
    };

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardBody>
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold">
                            Point Events History
                        </h2>

                        <div className="flex flex-wrap gap-4 items-end">
                            <Select
                                className="w-48"
                                label="Filter by"
                                selectedKeys={[filter]}
                                onSelectionChange={(keys) =>
                                    setFilter(Array.from(keys)[0] as string)
                                }
                            >
                                <SelectItem key="all">All Events</SelectItem>
                                <SelectItem key="student">
                                    By Student
                                </SelectItem>
                                <SelectItem key="house">By House</SelectItem>
                            </Select>

                            {filter === "student" && (
                                <Select
                                    className="w-64"
                                    label="Select Student"
                                    selectedKeys={
                                        selectedStudent ? [selectedStudent] : []
                                    }
                                    onSelectionChange={(keys) =>
                                        setSelectedStudent(
                                            (Array.from(keys)[0] as string) ||
                                                "",
                                        )
                                    }
                                >
                                    {students.map((student) => (
                                        <SelectItem key={student.id}>
                                            {student.name} ({student.house})
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}

                            {filter === "house" && (
                                <Select
                                    className="w-48"
                                    label="Select House"
                                    selectedKeys={
                                        selectedHouse ? [selectedHouse] : []
                                    }
                                    onSelectionChange={(keys) =>
                                        setSelectedHouse(
                                            (Array.from(keys)[0] as string) ||
                                                "",
                                        )
                                    }
                                >
                                    {houses.map((house) => (
                                        <SelectItem key={house.name}>
                                            {house.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}

                            <Input
                                className="w-32"
                                label="Limit"
                                type="number"
                                value={limit.toString()}
                                onChange={(e) =>
                                    setLimit(parseInt(e.target.value) || 50)
                                }
                            />

                            <Button
                                color="primary"
                                isLoading={loading}
                                onPress={loadEvents}
                            >
                                Load Events
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Table aria-label="Point events table">
                        <TableHeader>
                            <TableColumn>TIMESTAMP</TableColumn>
                            <TableColumn>STUDENT</TableColumn>
                            <TableColumn>HOUSE</TableColumn>
                            <TableColumn>CATEGORY</TableColumn>
                            <TableColumn>POINTS</TableColumn>
                            <TableColumn>REASON</TableColumn>
                            <TableColumn>ADDED BY</TableColumn>
                            <TableColumn>TYPE</TableColumn>
                        </TableHeader>
                        <TableBody isLoading={loading} items={events}>
                            {(event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        {formatTimestamp(event.timestamp)}
                                    </TableCell>
                                    <TableCell>{event.studentName}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
                                            {event.house}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{event.category}</TableCell>
                                    <TableCell>
                                        <Chip
                                            color={getPointsChipColor(
                                                event.points,
                                            )}
                                            size="sm"
                                        >
                                            {event.points > 0 ? "+" : ""}
                                            {event.points}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {event.reason || "No reason provided"}
                                    </TableCell>
                                    <TableCell>{event.addedBy}</TableCell>
                                    <TableCell>
                                        <Chip
                                            color={
                                                event.isManualEntry
                                                    ? "primary"
                                                    : "secondary"
                                            }
                                            size="sm"
                                            variant="flat"
                                        >
                                            {event.isManualEntry
                                                ? "Manual"
                                                : "Auto"}
                                        </Chip>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {events.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            No point events found
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default PointEventsViewer;
