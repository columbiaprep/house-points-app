"use client";
import { useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { recalculateHouseTotals } from "@/firebase-configuration/firebaseDb";

export default function RecalculateHouseTotals() {
    const [isRecalculating, setIsRecalculating] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRecalculate = async () => {
        if (!confirm("This will recalculate house totals from individual student data. Continue?")) {
            return;
        }

        setIsRecalculating(true);
        setError(null);
        setResults(null);

        try {
            const result = await recalculateHouseTotals();

            if (result.success) {
                setResults(result.results);
            } else {
                setError(result.error || "Unknown error occurred");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to recalculate totals");
        } finally {
            setIsRecalculating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <h2 className="text-xl font-bold">Recalculate House Totals</h2>
            </CardHeader>
            <CardBody>
                <p className="text-sm text-gray-600 mb-4">
                    This will recalculate all house point totals by summing individual student points
                    and adding bonus points. Use this if you suspect point totals are incorrect.
                </p>

                <Button
                    color="primary"
                    isLoading={isRecalculating}
                    onPress={handleRecalculate}
                >
                    {isRecalculating ? "Recalculating..." : "Recalculate House Totals"}
                </Button>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {results && results.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-bold mb-2">Results:</h3>
                        {results.map((house: any) => (
                            <div
                                key={house.house}
                                className={`p-3 mb-2 rounded ${
                                    house.difference !== 0
                                        ? "bg-yellow-100"
                                        : "bg-green-100"
                                }`}
                            >
                                <div className="font-semibold">{house.house}</div>
                                <div className="text-sm">
                                    Old Total: {house.oldTotal} → New Total: {house.newTotal}
                                    {house.difference !== 0 && (
                                        <span className="ml-2 font-bold text-red-600">
                                            (Difference: {house.difference > 0 ? '+' : ''}{house.difference})
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {results && results.length === 0 && (
                    <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
                        All house totals are correct!
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
