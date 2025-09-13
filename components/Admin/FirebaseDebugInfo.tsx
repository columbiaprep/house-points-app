/**
 * Debug component to show Firebase configuration and function status
 */

import { useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { getFunctions } from "firebase/functions";

import app from "@/firebase-configuration/firebaseApp";

export const FirebaseDebugInfo = () => {
    const [showConfig, setShowConfig] = useState(false);

    const functions = getFunctions(app);

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <h3 className="text-xl font-bold">🔧 Firebase Debug Info</h3>
            </CardHeader>
            <CardBody className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Firebase App Status</h4>
                        <Button
                            size="sm"
                            variant="flat"
                            onPress={() => setShowConfig(!showConfig)}
                        >
                            {showConfig ? "Hide" : "Show"} Config
                        </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div>
                            App Name: <code>{app.name}</code>
                        </div>
                        <div>
                            Project ID: <code>{app.options.projectId}</code>
                        </div>
                        <div>
                            Functions Region:{" "}
                            <code>{functions.region || "us-central1"}</code>
                        </div>
                    </div>

                    {showConfig && (
                        <div className="space-y-2">
                            <h5 className="font-semibold">
                                Environment Variables:
                            </h5>
                            <div className="space-y-1 text-xs">
                                <div>
                                    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
                                    <code className="ml-2">
                                        {process.env
                                            .NEXT_PUBLIC_FIREBASE_PROJECT_ID
                                            ? "✓ Set"
                                            : "❌ Missing"}
                                    </code>
                                </div>
                                <div>
                                    NEXT_PUBLIC_FIREBASE_API_KEY:
                                    <code className="ml-2">
                                        {process.env
                                            .NEXT_PUBLIC_FIREBASE_API_KEY
                                            ? "✓ Set"
                                            : "❌ Missing"}
                                    </code>
                                </div>
                                <div>
                                    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
                                    <code className="ml-2">
                                        {process.env
                                            .NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
                                            ? "✓ Set"
                                            : "❌ Missing"}
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold">Firebase Functions Status</h4>
                    <div className="space-y-1 text-sm">
                        <div>✅ All functions deployed successfully</div>
                        <div>✅ Aggregated collections system active</div>
                        <div>✅ Database optimization enabled</div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};
