"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    Divider,
} from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";
import {
    getAllRollbackRequests,
    requestBatchRollback,
    confirmBatchRollback,
    getAllPointEvents,
    type RollbackRequest,
    type PointEvent,
} from "@/firebase-configuration/firebaseDb";

const BatchRollbackManager = () => {
    const { user } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [rollbackRequests, setRollbackRequests] = useState<RollbackRequest[]>([]);
    const [recentBatches, setRecentBatches] = useState<Array<{batchId: string, timestamp: Date, studentsAffected: number, totalPoints: number, addedBy: string}>>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RollbackRequest | null>(null);
    const [confirmationCode, setConfirmationCode] = useState("");
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load existing rollback requests
            const requests = await getAllRollbackRequests();
            setRollbackRequests(requests);

            // Load recent batch operations for rollback requests
            // Use a simpler approach to avoid index requirements
            const events = await getAllPointEvents(200);
            const batchSummaries = new Map();

            events.forEach(event => {
                if (event.batchId && event.studentId && event.studentId !== 'BULK_OPERATION') {
                    if (!batchSummaries.has(event.batchId)) {
                        batchSummaries.set(event.batchId, {
                            batchId: event.batchId,
                            timestamp: event.timestamp,
                            studentsAffected: 0,
                            totalPoints: 0,
                            addedBy: event.addedBy,
                        });
                    }
                    const summary = batchSummaries.get(event.batchId);
                    summary.studentsAffected++;
                    summary.totalPoints += event.points;
                }
            });

            setRecentBatches(Array.from(batchSummaries.values()).slice(0, 10));
        } catch (error) {
            console.error("Failed to load rollback data:", error);
            setMessage({text: "Failed to load rollback data", type: "error"});
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRollback = async (batchId: string) => {
        if (!user?.email) return;

        setLoading(true);
        try {
            const request = await requestBatchRollback(batchId, user.email);
            setSelectedRequest(request);
            onOpen();
            await loadData();
            setMessage({text: "Rollback request created successfully", type: "success"});
        } catch (error: any) {
            console.error("Failed to request rollback:", error);
            setMessage({text: error.message || "Failed to request rollback", type: "error"});
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmRollback = async () => {
        if (!selectedRequest || !user?.email || !confirmationCode) return;

        setLoading(true);
        try {
            await confirmBatchRollback(selectedRequest.batchId, user.email, confirmationCode);
            setMessage({text: "Batch rollback executed successfully", type: "success"});
            onClose();
            setSelectedRequest(null);
            setConfirmationCode("");
            await loadData();
        } catch (error: any) {
            console.error("Failed to confirm rollback:", error);
            setMessage({text: error.message || "Failed to execute rollback", type: "error"});
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_confirmation': return 'warning';
            case 'executed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    return (
        <Card className="w-full">
            <CardBody className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">🔄 Batch Rollback Manager</h3>
                    <Button size="sm" variant="flat" onPress={loadData} isLoading={loading}>
                        Refresh
                    </Button>
                </div>

                {message && (
                    <div className={`text-center text-sm p-2 rounded ${
                        message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Recent Batch Operations</h4>
                        <Table aria-label="Recent batch operations">
                            <TableHeader>
                                <TableColumn>BATCH ID</TableColumn>
                                <TableColumn>DATE</TableColumn>
                                <TableColumn>STUDENTS</TableColumn>
                                <TableColumn>POINTS</TableColumn>
                                <TableColumn>ADDED BY</TableColumn>
                                <TableColumn>ACTION</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No recent batch operations found">
                                {recentBatches.map((batch) => {
                                    const hasRequest = rollbackRequests.find(r => r.batchId === batch.batchId);
                                    return (
                                        <TableRow key={batch.batchId}>
                                            <TableCell className="font-mono text-xs">
                                                {batch.batchId.substring(0, 20)}...
                                            </TableCell>
                                            <TableCell>{formatDate(batch.timestamp)}</TableCell>
                                            <TableCell>{batch.studentsAffected}</TableCell>
                                            <TableCell>{batch.totalPoints}</TableCell>
                                            <TableCell>{batch.addedBy}</TableCell>
                                            <TableCell>
                                                {hasRequest ? (
                                                    <Chip size="sm" color={getStatusColor(hasRequest.status)}>
                                                        {hasRequest.status.replace('_', ' ')}
                                                    </Chip>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        color="warning"
                                                        variant="flat"
                                                        onPress={() => handleRequestRollback(batch.batchId)}
                                                        isLoading={loading}
                                                    >
                                                        Request Rollback
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {rollbackRequests.length > 0 && (
                        <>
                            <Divider />
                            <div>
                                <h4 className="font-semibold mb-2">Rollback Requests</h4>
                                <Table aria-label="Rollback requests">
                                    <TableHeader>
                                        <TableColumn>BATCH ID</TableColumn>
                                        <TableColumn>REQUESTED</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>STUDENTS</TableColumn>
                                        <TableColumn>POINTS</TableColumn>
                                        <TableColumn>ACTION</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {rollbackRequests.map((request) => (
                                            <TableRow key={request.batchId}>
                                                <TableCell className="font-mono text-xs">
                                                    {request.batchId.substring(0, 20)}...
                                                </TableCell>
                                                <TableCell>{formatDate(request.requestTime)}</TableCell>
                                                <TableCell>
                                                    <Chip size="sm" color={getStatusColor(request.status)}>
                                                        {request.status.replace('_', ' ')}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>{request.preview.studentsAffected}</TableCell>
                                                <TableCell>-{request.preview.totalPointsToRemove}</TableCell>
                                                <TableCell>
                                                    {request.status === 'pending_confirmation' && (
                                                        <Button
                                                            size="sm"
                                                            color="danger"
                                                            variant="flat"
                                                            onPress={() => {
                                                                setSelectedRequest(request);
                                                                onOpen();
                                                            }}
                                                        >
                                                            Confirm Rollback
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </div>

                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalContent>
                        <ModalHeader>Confirm Batch Rollback</ModalHeader>
                        <ModalBody>
                            {selectedRequest && (
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Rollback Preview</h4>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Students affected:</strong> {selectedRequest.preview.studentsAffected}</p>
                                            <p><strong>Points to remove:</strong> {selectedRequest.preview.totalPointsToRemove}</p>
                                            <p><strong>Categories:</strong> {Object.keys(selectedRequest.preview.breakdown).join(', ')}</p>
                                            <p><strong>Originally added by:</strong> {selectedRequest.preview.addedBy}</p>
                                            <p><strong>Original timestamp:</strong> {formatDate(selectedRequest.preview.timestamp)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                        <h4 className="font-semibold text-red-800 mb-2">🚨 Safety Requirements</h4>
                                        <div className="text-sm space-y-1 text-red-700">
                                            <p>• 30-minute cooling-off period required</p>
                                            <p>• Confirmation code required</p>
                                            <p>• This action cannot be undone</p>
                                            <p>• All affected students will lose the specified points</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Input
                                            label={`Confirmation Code: ${selectedRequest.confirmationCode}`}
                                            placeholder="Enter the confirmation code above"
                                            value={confirmationCode}
                                            onChange={(e) => setConfirmationCode(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="danger"
                                onPress={handleConfirmRollback}
                                isLoading={loading}
                                isDisabled={!confirmationCode || confirmationCode !== selectedRequest?.confirmationCode}
                            >
                                Execute Rollback
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </CardBody>
        </Card>
    );
};

export default BatchRollbackManager;