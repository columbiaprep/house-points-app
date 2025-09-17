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
    CardHeader,
    Button,
    Chip,
    Spinner,
} from "@heroui/react";

import {
    type PointEvent,
    getPointEventsForStudent,
} from "@/firebase-configuration/firebaseDb";

interface StudentPointHistoryProps {
    studentId: string;
    studentName?: string;
    initialLimit?: number;
}

const StudentPointHistory = ({
    studentId,
    studentName,
    initialLimit = 20,
}: StudentPointHistoryProps) => {
    const [events, setEvents] = useState<PointEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(initialLimit);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadEvents();
    }, [studentId]);

    const loadEvents = async (newLimit?: number) => {
        if (!studentId) return;

        setLoading(true);
        try {
            const currentLimit = newLimit || limit;
            const eventData = await getPointEventsForStudent(
                studentId,
                currentLimit,
            );

            setEvents(eventData);
            setHasMore(eventData.length === currentLimit);
        } catch (error) {
            console.error("Failed to load student events:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const newLimit = limit + 20;

        setLimit(newLimit);
        loadEvents(newLimit);
    };

    const formatTimestamp = (timestamp: Date) => {
        const date = new Date(timestamp);

        return (
            date.toLocaleDateString() +
            " " +
            date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };

    const getPointsChipColor = (points: number) => {
        if (points > 0) return "success";
        if (points < 0) return "danger";

        return "default";
    };

    const getCategoryTotals = () => {
        const totals: { [key: string]: number } = {};

        events.forEach((event) => {
            totals[event.category] =
                (totals[event.category] || 0) + event.points;
        });

        return totals;
    };

    if (loading && events.length === 0) {
        return (
            <Card>
                <CardBody className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h3 className="text-xl font-semibold">
                                Point History
                                {studentName && ` - ${studentName}`}
                            </h3>
                            <p className="text-small text-gray-500">
                                {events.length} recent transactions
                            </p>
                        </div>

                        {/* Category totals */}
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(getCategoryTotals()).map(
                                ([category, total]) => (
                                    <Chip
                                        key={category}
                                        color={getPointsChipColor(total)}
                                        size="sm"
                                        variant="flat"
                                    >
                                        {category}: {total > 0 ? "+" : ""}
                                        {total}
                                    </Chip>
                                ),
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardBody>
                    {events.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No point history found
                        </div>
                    ) : (
                        <>
                            <Table aria-label="Student point history">
                                <TableHeader>
                                    <TableColumn>DATE & TIME</TableColumn>
                                    <TableColumn>CATEGORY</TableColumn>
                                    <TableColumn>POINTS</TableColumn>
                                    <TableColumn>REASON</TableColumn>
                                    <TableColumn>ADDED BY</TableColumn>
                                </TableHeader>
                                <TableBody items={events}>
                                    {(event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="text-small">
                                                {formatTimestamp(
                                                    event.timestamp,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="sm" variant="flat">
                                                    {event.category}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getPointsChipColor(
                                                        event.points,
                                                    )}
                                                    size="sm"
                                                >
                                                    {event.points > 0
                                                        ? "+"
                                                        : ""}
                                                    {event.points}
                                                </Chip>
                                            </TableCell>
                                            <TableCell className="text-small max-w-xs">
                                                {event.reason ||
                                                    "No reason provided"}
                                            </TableCell>
                                            <TableCell className="text-small">
                                                {event.addedBy}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {hasMore && (
                                <div className="flex justify-center mt-4">
                                    <Button
                                        isLoading={loading}
                                        variant="flat"
                                        onPress={loadMore}
                                    >
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default StudentPointHistory;
