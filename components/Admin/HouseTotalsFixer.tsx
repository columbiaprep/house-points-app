"use client";
import { useState } from "react";
import {
    Card,
    CardBody,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Chip,
} from "@heroui/react";

import { recalculateHouseTotals } from "@/firebase-configuration/firebaseDb";

interface RecalculationResult {
    house: string;
    oldTotal: number;
    newTotal: number;
    difference: number;
    categoryBreakdown: Record<string, number>;
}

const HouseTotalsFixer = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [results, setResults] = useState<RecalculationResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleRecalculate = async () => {
        setIsRecalculating(true);
        setError(null);
        setResults([]);

        try {
            const result = await recalculateHouseTotals();

            if (result.success) {
                setResults(result.results);
                onOpen();
            } else {
                setError(result.error || "Failed to recalculate house totals");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setIsRecalculating(false);
        }
    };

    const getTotalDifference = () => {
        return results.reduce((sum, result) => sum + Math.abs(result.difference), 0);
    };

    const getStatusColor = (difference: number) => {
        if (difference === 0) return "success";
        if (Math.abs(difference) > 50) return "danger";
        return "warning";
    };

    return (
        <>
            <Card className="mt-4">
                <CardBody>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold">House Totals Fixer</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Recalculate house totals from individual student data to fix double-counting issues
                            </p>
                        </div>
                        <Button
                            color="primary"
                            isLoading={isRecalculating}
                            onPress={handleRecalculate}
                        >
                            {isRecalculating ? "Recalculating..." : "Fix House Totals"}
                        </Button>
                    </div>

                    {error && (
                        <Card className="border-red-500 mt-4">
                            <CardBody>
                                <p className="text-red-600">{error}</p>
                            </CardBody>
                        </Card>
                    )}

                    <div className="text-sm text-gray-500 mt-2">
                        <p><strong>What this does:</strong></p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Sums up all individual student points by house</li>
                            <li>Preserves existing bonus points</li>
                            <li>Updates house totals to: studentPoints + bonusPoints</li>
                            <li>Shows you exactly what changed before applying</li>
                        </ul>
                    </div>
                </CardBody>
            </Card>

            <Modal
                isOpen={isOpen}
                size="3xl"
                scrollBehavior="inside"
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                House Totals Recalculation Results
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gray-100 rounded">
                                        <span className="font-semibold">Total Points Adjusted:</span>
                                        <Chip
                                            color={getTotalDifference() > 0 ? "warning" : "success"}
                                            variant="flat"
                                        >
                                            {getTotalDifference()} points
                                        </Chip>
                                    </div>

                                    {results.map((result) => (
                                        <Card key={result.house} className="border">
                                            <CardBody>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold">
                                                            {result.house}
                                                        </h3>
                                                        <Chip
                                                            color={getStatusColor(result.difference)}
                                                            variant="flat"
                                                        >
                                                            {result.difference > 0 ? "+" : ""}{result.difference}
                                                        </Chip>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Previous Total:</span>
                                                            <div className="font-mono">{result.oldTotal}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Corrected Total:</span>
                                                            <div className="font-mono">{result.newTotal}</div>
                                                        </div>
                                                    </div>

                                                    {Math.abs(result.difference) > 0 && (
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                                Category Breakdown:
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {Object.entries(result.categoryBreakdown)
                                                                    .filter(([_, points]) => points > 0)
                                                                    .map(([category, points]) => (
                                                                        <Chip
                                                                            key={category}
                                                                            size="sm"
                                                                            variant="flat"
                                                                        >
                                                                            {category}: {points}
                                                                        </Chip>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}

                                    {results.length === 0 && (
                                        <Card>
                                            <CardBody>
                                                <p className="text-center text-gray-600">
                                                    No houses found or no changes needed.
                                                </p>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default HouseTotalsFixer;