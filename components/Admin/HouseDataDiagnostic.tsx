"use client";
import { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { fetchAllHouses, getAllBonusPoints, HouseDocument } from "@/firebase-configuration/firebaseDb";

interface DiagnosticData {
    houseDocument: HouseDocument;
    bonusPointsSubcollection: any[];
    calculatedBonusTotal: number;
    calculatedStudentTotal: number;
    expectedTotal: number;
}

const HouseDataDiagnostic = () => {
    const [diagnosticData, setDiagnosticData] = useState<DiagnosticData[]>([]);
    const [loading, setLoading] = useState(false);

    const runDiagnostic = async () => {
        setLoading(true);
        try {
            console.log("🔍 Starting house data diagnostic...");

            // Get all houses
            const houses = await fetchAllHouses();
            console.log("Houses fetched:", houses.length);

            // Get all bonus points
            const allBonusPoints = await getAllBonusPoints();
            console.log("Bonus points data:", allBonusPoints);

            const diagnostics: DiagnosticData[] = [];

            for (const house of houses) {
                const houseBonusPoints = allBonusPoints[house.id] || [];
                const calculatedBonusTotal = houseBonusPoints.reduce((sum: number, bp: any) => sum + bp.points, 0);

                // Calculate student points (sum all category fields except metadata)
                const excludeFields = ['id', 'name', 'colorName', 'accentColor', 'place', 'studentPoints', 'bonusPoints', 'totalPoints'];
                const calculatedStudentTotal = Object.entries(house)
                    .filter(([key, value]) => !excludeFields.includes(key) && typeof value === 'number')
                    .reduce((sum, [_, value]) => sum + (value as number), 0);

                const expectedTotal = calculatedStudentTotal + calculatedBonusTotal;

                diagnostics.push({
                    houseDocument: house,
                    bonusPointsSubcollection: houseBonusPoints,
                    calculatedBonusTotal,
                    calculatedStudentTotal,
                    expectedTotal
                });

                console.log(`🏠 ${house.name}:`, {
                    storedStudentPoints: house.studentPoints,
                    calculatedStudentPoints: calculatedStudentTotal,
                    storedBonusPoints: house.bonusPoints,
                    calculatedBonusPoints: calculatedBonusTotal,
                    storedTotalPoints: house.totalPoints,
                    expectedTotalPoints: expectedTotal,
                    houseDocument: house,
                    bonusPointsSubcollection: houseBonusPoints
                });
            }

            setDiagnosticData(diagnostics);
        } catch (error) {
            console.error("Diagnostic error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <h3 className="text-lg font-bold">🔍 House Data Diagnostic</h3>
            </CardHeader>
            <CardBody>
                <Button
                    onPress={runDiagnostic}
                    isLoading={loading}
                    color="primary"
                    className="mb-4"
                >
                    Run Diagnostic
                </Button>

                {diagnosticData.length > 0 && (
                    <div className="space-y-4">
                        {diagnosticData.map((data) => {
                            const house = data.houseDocument;
                            const hasDiscrepancy =
                                house.studentPoints !== data.calculatedStudentTotal ||
                                house.bonusPoints !== data.calculatedBonusTotal ||
                                house.totalPoints !== data.expectedTotal;

                            return (
                                <div
                                    key={house.id}
                                    className={`p-4 border rounded ${hasDiscrepancy ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}
                                >
                                    <h4 className="font-bold text-lg">{house.name}</h4>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <p><strong>Stored in House Doc:</strong></p>
                                            <p>Student Points: {house.studentPoints ?? 'undefined'}</p>
                                            <p>Bonus Points: {house.bonusPoints ?? 'undefined'}</p>
                                            <p>Total Points: {house.totalPoints ?? 'undefined'}</p>
                                        </div>
                                        <div>
                                            <p><strong>Calculated:</strong></p>
                                            <p>Student Points: {data.calculatedStudentTotal}</p>
                                            <p>Bonus Points: {data.calculatedBonusTotal}</p>
                                            <p>Expected Total: {data.expectedTotal}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p><strong>Bonus Points in Subcollection:</strong> {data.bonusPointsSubcollection.length}</p>
                                        {data.bonusPointsSubcollection.length > 0 && (
                                            <details className="mt-1">
                                                <summary>View Bonus Points</summary>
                                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                                    {JSON.stringify(data.bonusPointsSubcollection, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default HouseDataDiagnostic;