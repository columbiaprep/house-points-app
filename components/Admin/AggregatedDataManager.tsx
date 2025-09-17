/**
 * Admin component for managing aggregated collections
 * Add this to your admin dashboard
 */

import { useState } from "react";
import { Button, Card, CardBody, Progress } from "@heroui/react";
import { getFunctions, httpsCallable } from "firebase/functions";

import app from "@/firebase-configuration/firebaseApp";
import { checkAggregatedCollectionsExist } from "@/firebase-configuration/optimizedFirebaseDb";

const functions = getFunctions(app);

export const AggregatedDataManager = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{
        houseSummaries: boolean;
        houseRankings: boolean;
    } | null>(null);
    const [lastInitialized, setLastInitialized] = useState<string | null>(null);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const result = await checkAggregatedCollectionsExist();

            setStatus(result);
        } catch (error) {
            console.error("Error checking status:", error);
        } finally {
            setLoading(false);
        }
    };

    const initializeCollections = async () => {
        setLoading(true);
        try {
            const initializeFunction = httpsCallable(
                functions,
                "initializeAggregatedCollections",
            );
            const result = await initializeFunction();

            console.log("Initialization result:", result.data);
            setLastInitialized(new Date().toLocaleString());

            // Refresh status
            await checkStatus();
        } catch (error) {
            console.error("Error initializing collections:", error);
            alert(
                "Failed to initialize collections. Check console for details.",
            );
        } finally {
            setLoading(false);
        }
    };

    const rebuildHouseSummaries = async () => {
        setLoading(true);
        try {
            const rebuildFunction = httpsCallable(
                functions,
                "rebuildHouseSummaries",
            );
            const result = await rebuildFunction();

            console.log("Rebuild house summaries result:", result.data);
            alert(
                `Successfully rebuilt ${result.data.housesUpdated} house summaries`,
            );
        } catch (error) {
            console.error("Error rebuilding house summaries:", error);
            alert(
                "Failed to rebuild house summaries. Check console for details.",
            );
        } finally {
            setLoading(false);
        }
    };

    const rebuildHouseRankings = async () => {
        setLoading(true);
        try {
            const rebuildFunction = httpsCallable(
                functions,
                "rebuildHouseRankings",
            );
            const result = await rebuildFunction();

            console.log("Rebuild house rankings result:", result.data);
            alert(
                `Successfully rebuilt rankings for ${result.data.studentsUpdated} students across ${result.data.housesProcessed} houses`,
            );
        } catch (error) {
            console.error("Error rebuilding house rankings:", error);
            alert(
                "Failed to rebuild house rankings. Check console for details.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg">
            <CardBody className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">📊 Data Management</h3>
                    <Button
                        isLoading={loading}
                        size="sm"
                        variant="flat"
                        onPress={checkStatus}
                    >
                        Check Status
                    </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Rebuild aggregated collections for optimized performance
                </p>
                {/* Status Section */}
                {status && (
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>House Summaries:</span>
                            <span
                                className={
                                    status.houseSummaries
                                        ? "text-green-600"
                                        : "text-red-600"
                                }
                            >
                                {status.houseSummaries
                                    ? "✅ Ready"
                                    : "❌ Missing"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>House Rankings:</span>
                            <span
                                className={
                                    status.houseRankings
                                        ? "text-green-600"
                                        : "text-red-600"
                                }
                            >
                                {status.houseRankings
                                    ? "✅ Ready"
                                    : "❌ Missing"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Actions Section */}
                <div className="space-y-3">
                    <h4 className="font-semibold">Actions</h4>

                    <Button
                        className="w-full"
                        color="primary"
                        isLoading={loading}
                        onPress={initializeCollections}
                    >
                        🚀 Initialize All Aggregated Collections
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            color="secondary"
                            isLoading={loading}
                            variant="flat"
                            onPress={rebuildHouseSummaries}
                        >
                            🏠 Rebuild House Summaries
                        </Button>

                        <Button
                            color="secondary"
                            isLoading={loading}
                            variant="flat"
                            onPress={rebuildHouseRankings}
                        >
                            🎯 Rebuild Rankings
                        </Button>
                    </div>
                </div>

                {lastInitialized && (
                    <div className="text-xs text-gray-500">
                        Last initialized: {lastInitialized}
                    </div>
                )}

                {loading && <Progress isIndeterminate size="sm" />}
            </CardBody>
        </Card>
    );
};
