"use client";
import { useState, useEffect } from "react";
import { Button, Card, CardBody, Textarea, Chip } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/firebase-configuration/firebaseApp";
import {
    writeToIndividualData,
    fetchIndividual,
    fetchAllHouses,
    getUserAccountType
} from "@/firebase-configuration/firebaseDb";
import { doc, getDoc, setDoc } from "@firebase/firestore";

interface LogEntry {
    timestamp: string;
    level: "info" | "error" | "success" | "warning";
    message: string;
    data?: any;
}

export default function AuthDebugTester() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const authContext = useAuth();

    const addLog = (level: LogEntry["level"], message: string, data?: any) => {
        const timestamp = new Date().toISOString();
        setLogs(prev => [...prev, { timestamp, level, message, data }]);
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || "");
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const runAuthTests = async () => {
        setIsRunning(true);
        clearLogs();

        try {
            addLog("info", "=== AUTHENTICATION DEBUG TEST STARTED ===");

            // 1. Check auth context state
            addLog("info", "Auth Context State:", {
                user: authContext.user?.email || "null",
                accountType: authContext.accountType,
                loading: authContext.loading,
                userDbData: authContext.userDbData?.name || "null"
            });

            // 2. Check Firebase Auth current user
            addLog("info", "Firebase Auth Current User:", {
                email: auth.currentUser?.email || "null",
                uid: auth.currentUser?.uid || "null",
                emailVerified: auth.currentUser?.emailVerified || false
            });

            // 3. Check if we can get ID token
            if (auth.currentUser) {
                try {
                    const token = await auth.currentUser.getIdToken();
                    addLog("success", "Successfully got ID token", { tokenLength: token.length });
                } catch (error) {
                    addLog("error", "Failed to get ID token", error);
                }
            } else {
                addLog("warning", "No current user - cannot get token");
            }

            // 4. Test direct Firestore read with current auth
            addLog("info", "Testing direct Firestore read...");
            try {
                const testDocRef = doc(db, "users", auth.currentUser?.email || "test");
                const testDoc = await getDoc(testDocRef);
                addLog("success", "Direct Firestore read successful", {
                    exists: testDoc.exists(),
                    data: testDoc.exists() ? testDoc.data() : "Document does not exist"
                });
            } catch (error) {
                addLog("error", "Direct Firestore read failed", error);
            }

            // 5. Test getUserAccountType function
            addLog("info", "Testing getUserAccountType function...");
            try {
                if (auth.currentUser?.email) {
                    const accountType = await getUserAccountType(auth.currentUser.email);
                    addLog("success", "getUserAccountType successful", { accountType });
                } else {
                    addLog("warning", "No current user email for getUserAccountType test");
                }
            } catch (error) {
                addLog("error", "getUserAccountType failed", error);
            }

            // 6. Test fetchIndividual function
            addLog("info", "Testing fetchIndividual function...");
            try {
                const individual = await fetchIndividual("srosado26@cgps.org");
                addLog("success", "fetchIndividual successful", {
                    name: individual.name,
                    house: individual.house,
                    totalPoints: individual.totalPoints
                });
            } catch (error) {
                addLog("error", "fetchIndividual failed", error);
            }

            // 7. Test fetchAllHouses function
            addLog("info", "Testing fetchAllHouses function...");
            try {
                const houses = await fetchAllHouses();
                addLog("success", "fetchAllHouses successful", {
                    count: houses.length,
                    firstHouse: houses[0]?.name || "none"
                });
            } catch (error) {
                addLog("error", "fetchAllHouses failed", error);
            }

            // 8. Test adding points to student
            addLog("info", "Testing writeToIndividualData for srosado26@cgps.org...");
            try {
                await writeToIndividualData("service", "srosado26@cgps.org", 1);
                addLog("success", "writeToIndividualData successful - added 1 service point");
            } catch (error) {
                addLog("error", "writeToIndividualData failed", error);
            }

            addLog("info", "=== AUTHENTICATION DEBUG TEST COMPLETED ===");

        } catch (error) {
            addLog("error", "Test suite failed", error);
        } finally {
            setIsRunning(false);
        }
    };

    const getLogColor = (level: LogEntry["level"]) => {
        switch (level) {
            case "success": return "success";
            case "error": return "danger";
            case "warning": return "warning";
            case "info": return "primary";
            default: return "default";
        }
    };

    return (
        <Card className="w-full">
            <CardBody>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Authentication & Permissions Debug Tester</h3>

                    <div className="flex gap-2">
                        <Button
                            color="primary"
                            onClick={runAuthTests}
                            isLoading={isRunning}
                            isDisabled={isRunning}
                        >
                            Run Debug Tests
                        </Button>
                        <Button
                            color="secondary"
                            variant="light"
                            onClick={clearLogs}
                            isDisabled={isRunning}
                        >
                            Clear Logs
                        </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                        {logs.length === 0 ? (
                            <p className="text-gray-500 italic">No logs yet. Run the debug tests to see output.</p>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log, index) => (
                                    <div key={index} className="text-sm">
                                        <div className="flex items-start gap-2">
                                            <Chip size="sm" color={getLogColor(log.level)} variant="flat">
                                                {log.level.toUpperCase()}
                                            </Chip>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="ml-2 mt-1">
                                            <div className="font-mono">{log.message}</div>
                                            {log.data && (
                                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(log.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        <p><strong>Current Auth State:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>User: {authContext.user?.email || "Not authenticated"}</li>
                            <li>Account Type: {authContext.accountType || "Unknown"}</li>
                            <li>Loading: {authContext.loading ? "Yes" : "No"}</li>
                            <li>User DB Data: {authContext.userDbData?.name || "None"}</li>
                        </ul>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}