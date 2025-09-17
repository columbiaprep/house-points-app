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
    Select,
    SelectItem,
} from "@heroui/react";

import {
    type PointEvent,
    getPointEventsForHouse,
} from "@/firebase-configuration/firebaseDb";

interface HousePointHistoryProps {
    house: string;
    houseName?: string;
    initialLimit?: number;
}

const HousePointHistory = ({
    house,
    houseName,
    initialLimit = 25,
}: HousePointHistoryProps) => {
    const [events, setEvents] = useState<PointEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(initialLimit);
    const [hasMore, setHasMore] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        loadEvents();
    }, [house]);

    const loadEvents = async (newLimit?: number) => {
        if (!house) return;

        setLoading(true);
        try {
            const currentLimit = newLimit || limit;
            const eventData = await getPointEventsForHouse(
                house,
                currentLimit * 2,
            ); // Load extra for filtering

            setEvents(eventData);
            setHasMore(eventData.length === currentLimit * 2);
        } catch (error) {
            console.error("Failed to load house events:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const newLimit = limit + 25;

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

    const getFilteredEvents = () => {
        if (categoryFilter === "all") return events.slice(0, limit);

        return events
            .filter((event) => event.category === categoryFilter)
            .slice(0, limit);
    };

    const getCategoryTotals = () => {
        const totals: { [key: string]: number } = {};

        events.forEach((event) => {
            totals[event.category] =
                (totals[event.category] || 0) + event.points;
        });

        return totals;
    };

    const getUniqueCategories = () => {
        const categories = Array.from(
            new Set(events.map((event) => event.category)),
        );

        return categories.sort();
    };

    const getRecentContributors = () => {
        const contributors: { [key: string]: number } = {};
        const recentEvents = events.slice(0, 50); // Last 50 events

        recentEvents.forEach((event) => {
            contributors[event.studentName] =
                (contributors[event.studentName] || 0) + event.points;
        });

        return Object.entries(contributors)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    const filteredEvents = getFilteredEvents();

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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <h4 className="font-semibold">Category Totals</h4>
                    </CardHeader>
                    <CardBody>
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
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h4 className="font-semibold">Top Contributors</h4>
                    </CardHeader>
                    <CardBody>
                        <div className="flex flex-wrap gap-2">
                            {getRecentContributors().map(
                                ([student, points]) => (
                                    <Chip
                                        key={student}
                                        color={getPointsChipColor(points)}
                                        size="sm"
                                        variant="flat"
                                    >
                                        {student}: {points > 0 ? "+" : ""}
                                        {points}
                                    </Chip>
                                ),
                            )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h3 className="text-xl font-semibold">
                                {houseName || house} Point History
                            </h3>
                            <p className="text-small text-gray-500">
                                {events.length} total transactions
                            </p>
                        </div>

                        <div className="flex gap-2 items-center">
                            <Select
                                className="w-48"
                                label="Filter by category"
                                selectedKeys={[categoryFilter]}
                                size="sm"
                                onSelectionChange={(keys) =>
                                    setCategoryFilter(
                                        Array.from(keys)[0] as string,
                                    )
                                }
                            >
                                <SelectItem key="all">
                                    All Categories
                                </SelectItem>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardBody>
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No point history found
                        </div>
                    ) : (
                        <>
                            <Table aria-label="House point history">
                                <TableHeader>
                                    <TableColumn>DATE & TIME</TableColumn>
                                    <TableColumn>STUDENT</TableColumn>
                                    <TableColumn>CATEGORY</TableColumn>
                                    <TableColumn>POINTS</TableColumn>
                                    <TableColumn>REASON</TableColumn>
                                    <TableColumn>ADDED BY</TableColumn>
                                </TableHeader>
                                <TableBody items={filteredEvents}>
                                    {(event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="text-small">
                                                {formatTimestamp(
                                                    event.timestamp,
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {event.studentName}
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

                            {hasMore && filteredEvents.length >= limit && (
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

export default HousePointHistory;
