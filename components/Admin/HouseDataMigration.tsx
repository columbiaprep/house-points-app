"use client";
import { useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase-configuration/firebaseApp";
import { fetchAllHouses, getAllBonusPoints, HouseDocument } from "@/firebase-configuration/firebaseDb";

const HouseDataMigration = () => {
    const [migrationLog, setMigrationLog] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const addLog = (message: string) => {
        console.log(message);
        setMigrationLog(prev => [...prev, message]);
    };

    const runMigration = async () => {
        setIsRunning(true);
        setMigrationLog([]);

        try {
            addLog("🚀 Starting house data migration...");

            // Get all houses and bonus points
            const houses = await fetchAllHouses();
            const allBonusPoints = await getAllBonusPoints();

            addLog(`📊 Found ${houses.length} houses to migrate`);

            let migratedCount = 0;
            let errorCount = 0;

            for (const house of houses) {
                try {
                    addLog(`🏠 Processing ${house.name}...`);

                    // Calculate student points (sum all category fields except metadata)
                    const excludeFields = [
                        'id', 'name', 'colorName', 'accentColor', 'place',
                        'studentPoints', 'bonusPoints', 'totalPoints'
                    ];

                    const calculatedStudentPoints = Object.entries(house)
                        .filter(([key, value]) => !excludeFields.includes(key) && typeof value === 'number')
                        .reduce((sum, [_, value]) => sum + (value as number), 0);

                    // Calculate bonus points from subcollection
                    const houseBonusPoints = allBonusPoints[house.id] || [];
                    const calculatedBonusPoints = houseBonusPoints.reduce((sum: number, bp: any) => sum + bp.points, 0);

                    // Calculate correct total
                    const correctTotalPoints = calculatedStudentPoints + calculatedBonusPoints;

                    // Check if migration is needed
                    const needsUpdate =
                        house.studentPoints !== calculatedStudentPoints ||
                        house.bonusPoints !== calculatedBonusPoints ||
                        house.totalPoints !== correctTotalPoints;

                    if (needsUpdate) {
                        addLog(`  ✏️  Updating: studentPoints(${house.studentPoints} → ${calculatedStudentPoints}), bonusPoints(${house.bonusPoints} → ${calculatedBonusPoints}), totalPoints(${house.totalPoints} → ${correctTotalPoints})`);

                        // Update the house document
                        const houseRef = doc(db, "houses", house.id);
                        await setDoc(houseRef, {
                            studentPoints: calculatedStudentPoints,
                            bonusPoints: calculatedBonusPoints,
                            totalPoints: correctTotalPoints,
                        }, { merge: true });

                        migratedCount++;
                        addLog(`  ✅ Successfully updated ${house.name}`);
                    } else {
                        addLog(`  ⏭️  ${house.name} already correct, skipping`);
                    }

                } catch (error) {
                    errorCount++;
                    addLog(`  ❌ Error updating ${house.name}: ${error}`);
                }
            }

            addLog(`🎉 Migration complete!`);
            addLog(`📈 Successfully migrated: ${migratedCount} houses`);
            if (errorCount > 0) {
                addLog(`⚠️  Errors encountered: ${errorCount} houses`);
            }

        } catch (error) {
            addLog(`💥 Migration failed: ${error}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <h3 className="text-lg font-bold">🔧 House Data Migration</h3>
                <p className="text-sm text-gray-600">
                    Migrates house documents to the new architecture with studentPoints, bonusPoints, and corrected totalPoints
                </p>
            </CardHeader>
            <CardBody>
                <Button
                    onPress={runMigration}
                    isLoading={isRunning}
                    color="warning"
                    className="mb-4"
                >
                    {isRunning ? "Running Migration..." : "Run Migration"}
                </Button>

                {migrationLog.length > 0 && (
                    <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
                        <h4 className="font-bold mb-2">Migration Log:</h4>
                        <div className="font-mono text-xs space-y-1">
                            {migrationLog.map((log, index) => (
                                <div key={index} className="whitespace-pre-wrap">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default HouseDataMigration;