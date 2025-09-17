"use client";
import { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    Input,
    Select,
    SelectItem,
    Textarea,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    RadioGroup,
    Radio,
    Progress,
} from "@heroui/react";

import {
    type IndividualDocument,
    type PointCategory,
    fetchIndividual,
} from "@/firebase-configuration/firebaseDb";
import {
    getCachedPointCategories,
    writePointsOptimized,
    batchWritePoints,
} from "@/firebase-configuration/cachedFirebaseDb";

interface StudentPointsDisplay {
    student: IndividualDocument;
    categoryBreakdown: { [key: string]: number };
    totalPoints: number;
}

const AdminStudentManager = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [pointsCategories, setPointsCategories] = useState<PointCategory[]>(
        [],
    );
    const [studentEmail, setStudentEmail] = useState("");
    const [bulkEmails, setBulkEmails] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [pointsToModify, setPointsToModify] = useState(0);
    const [operationType, setOperationType] = useState("add");
    const [mode, setMode] = useState<"single" | "bulk" | "csv">("single");
    const [studentData, setStudentData] = useState<StudentPointsDisplay | null>(
        null,
    );
    const [loading, setLoading] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvProcessing, setCsvProcessing] = useState(false);
    const [csvProgress, setCsvProgress] = useState(0);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    // Load point categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await getCachedPointCategories();

                setPointsCategories(categories);
            } catch (error) {
                console.error("Error loading categories:", error);
                setMessage({
                    text: "Error loading point categories",
                    type: "error",
                });
            }
        };

        loadCategories();
    }, []);

    const clearForm = () => {
        setStudentEmail("");
        setBulkEmails("");
        setCsvFile(null);
        setCsvProgress(0);
        setSelectedCategory("");
        setPointsToModify(0);
        setOperationType("add");
        setStudentData(null);
        setMessage(null);
    };

    const handleLookupStudent = async () => {
        if (!studentEmail.trim()) {
            setMessage({
                text: "Please enter a student email",
                type: "error",
            });

            return;
        }

        setLoading(true);
        try {
            const student = await fetchIndividual(studentEmail.trim());

            // Calculate category breakdown and total
            const categoryBreakdown: { [key: string]: number } = {};
            let totalPoints = 0;

            pointsCategories.forEach((category) => {
                const points = student[category.key] || 0;

                categoryBreakdown[category.key] = points;
                totalPoints += points;
            });

            setStudentData({
                student,
                categoryBreakdown,
                totalPoints,
            });

            setMessage(null);
        } catch (error) {
            console.error("Error fetching student:", error);
            setMessage({
                text: "Student not found or error loading data",
                type: "error",
            });
            setStudentData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleModifyPoints = async () => {
        if (!selectedCategory) {
            setMessage({
                text: "Please select a point category",
                type: "error",
            });

            return;
        }

        if (pointsToModify === 0) {
            setMessage({
                text: "Please enter a non-zero point amount",
                type: "error",
            });

            return;
        }

        setLoading(true);

        try {
            if (mode === "single") {
                if (!studentEmail.trim()) {
                    setMessage({
                        text: "Please enter a student email",
                        type: "error",
                    });
                    setLoading(false);

                    return;
                }

                // Get student's house
                const student = await fetchIndividual(studentEmail.trim());
                const finalPoints =
                    operationType === "add" ? pointsToModify : -pointsToModify;

                const result = await writePointsOptimized(
                    selectedCategory,
                    studentEmail.trim(),
                    finalPoints,
                    student.house,
                );

                if (result.success) {
                    setMessage({
                        text: `Successfully ${operationType === "add" ? "added" : "subtracted"} ${Math.abs(pointsToModify)} points`,
                        type: "success",
                    });
                    // Refresh student data if we have it loaded
                    if (studentData) {
                        await handleLookupStudent();
                    }
                } else {
                    setMessage({
                        text: result.error || "Error modifying points",
                        type: "error",
                    });
                }
            } else {
                // Bulk mode
                if (!bulkEmails.trim()) {
                    setMessage({
                        text: "Please enter student emails",
                        type: "error",
                    });
                    setLoading(false);

                    return;
                }

                const emails = bulkEmails
                    .split(/[,\n]/)
                    .map((email) => email.trim())
                    .filter((email) => email.length > 0);

                if (emails.length === 0) {
                    setMessage({
                        text: "No valid emails found",
                        type: "error",
                    });
                    setLoading(false);

                    return;
                }

                // Prepare batch updates
                const updates = [];
                const finalPoints =
                    operationType === "add" ? pointsToModify : -pointsToModify;

                for (const email of emails) {
                    try {
                        const student = await fetchIndividual(email);

                        updates.push({
                            studentId: email,
                            house: student.house,
                            category: selectedCategory,
                            points: finalPoints,
                        });
                    } catch (error) {
                        console.error(
                            `Error fetching student ${email}:`,
                            error,
                        );
                        setMessage({
                            text: `Error: Student ${email} not found`,
                            type: "error",
                        });
                        setLoading(false);

                        return;
                    }
                }

                const result = await batchWritePoints(updates);

                if (result.success) {
                    setMessage({
                        text: `Successfully ${operationType === "add" ? "added" : "subtracted"} ${Math.abs(pointsToModify)} points to ${emails.length} students`,
                        type: "success",
                    });
                } else {
                    setMessage({
                        text:
                            result.error ||
                            "Error modifying points for bulk operation",
                        type: "error",
                    });
                }
            }
        } catch (error) {
            console.error("Error modifying points:", error);
            setMessage({
                text: "Error modifying points",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCsvFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        setCsvFile(file || null);
        setMessage(null);
    };

    const parseCsvContent = (
        content: string,
    ): { email: string; points?: number; category?: string }[] => {
        const lines = content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        // Check if first line is a header
        const firstLine = lines[0];
        const hasHeader =
            firstLine.toLowerCase().includes("email") ||
            firstLine.toLowerCase().includes("student") ||
            firstLine.toLowerCase().includes("points") ||
            firstLine.toLowerCase().includes("category");

        const dataLines = hasHeader ? lines.slice(1) : lines;

        return dataLines.map((line) => {
            const columns = line.split(",").map((col) => col.trim());

            if (columns.length === 1) {
                // Simple format: just email addresses
                return { email: columns[0] };
            } else if (columns.length === 3) {
                // Advanced format: email, category, points
                return {
                    email: columns[0],
                    category: columns[1],
                    points: parseInt(columns[2]) || 0,
                };
            } else {
                // Default to first column as email
                return { email: columns[0] };
            }
        });
    };

    const handleCsvProcessing = async () => {
        if (!csvFile) {
            setMessage({
                text: "Please select a CSV file",
                type: "error",
            });

            return;
        }

        setCsvProcessing(true);
        setCsvProgress(0);
        setMessage(null);

        try {
            const content = await csvFile.text();
            const csvData = parseCsvContent(content);

            if (csvData.length === 0) {
                setMessage({
                    text: "No valid data found in CSV file",
                    type: "error",
                });
                setCsvProcessing(false);

                return;
            }

            // Check if we're using the simple mode (all same category/points) or advanced mode
            const hasVariableData = csvData.some(
                (row) => row.category || row.points,
            );

            if (!hasVariableData) {
                // Simple mode - need category and points from form
                if (!selectedCategory || pointsToModify === 0) {
                    setMessage({
                        text: "Please select a category and enter points for simple CSV mode",
                        type: "error",
                    });
                    setCsvProcessing(false);

                    return;
                }
            }

            const updates = [];
            const failed: string[] = [];
            const finalPoints =
                operationType === "add" ? pointsToModify : -pointsToModify;

            for (let i = 0; i < csvData.length; i++) {
                const row = csvData[i];

                setCsvProgress((i / csvData.length) * 100);

                try {
                    const student = await fetchIndividual(row.email);
                    const category = hasVariableData
                        ? row.category || selectedCategory
                        : selectedCategory;
                    const points = hasVariableData
                        ? operationType === "add"
                            ? row.points || 0
                            : -(row.points || 0)
                        : finalPoints;

                    if (category) {
                        updates.push({
                            studentId: row.email,
                            house: student.house,
                            category: category,
                            points: points,
                        });
                    } else {
                        failed.push(`${row.email}: No category specified`);
                    }
                } catch (error) {
                    failed.push(`${row.email}: Student not found`);
                }
            }

            setCsvProgress(100);

            if (updates.length > 0) {
                const result = await batchWritePoints(updates);

                if (result.success) {
                    setMessage({
                        text: `Successfully processed ${updates.length} students${failed.length > 0 ? `. Failed: ${failed.length}` : ""}`,
                        type: "success",
                    });

                    if (failed.length > 0) {
                        console.log("Failed entries:", failed);
                    }
                } else {
                    setMessage({
                        text: result.error || "Error processing CSV batch",
                        type: "error",
                    });
                }
            } else {
                setMessage({
                    text: `No valid entries to process. Failed entries: ${failed.join(", ")}`,
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Error processing CSV:", error);
            setMessage({
                text: "Error reading or processing CSV file",
                type: "error",
            });
        } finally {
            setCsvProcessing(false);
            setCsvProgress(0);
        }
    };

    return (
        <>
            <Card className="mt-4">
                <CardBody>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            Student Point Management
                        </h2>
                        <Button color="primary" onPress={onOpen}>
                            Manage Student Points
                        </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                        Look up individual students, view their points, and
                        add/subtract points for single or multiple students.
                    </p>
                </CardBody>
            </Card>

            <Modal
                isOpen={isOpen}
                scrollBehavior="inside"
                size="2xl"
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold">
                                        Student Point Management
                                    </h3>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-6">
                                    {/* Mode Selection */}
                                    <RadioGroup
                                        label="Operation Mode"
                                        orientation="horizontal"
                                        value={mode}
                                        onValueChange={(value) => {
                                            setMode(
                                                value as
                                                    | "single"
                                                    | "bulk"
                                                    | "csv",
                                            );
                                            clearForm();
                                        }}
                                    >
                                        <Radio value="single">
                                            Single Student
                                        </Radio>
                                        <Radio value="bulk">
                                            Bulk Students
                                        </Radio>
                                        <Radio value="csv">CSV Upload</Radio>
                                    </RadioGroup>

                                    {/* Student Email Input */}
                                    {mode === "single" && (
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <Input
                                                    className="flex-1"
                                                    label="Student Email"
                                                    placeholder="student@cgps.org"
                                                    value={studentEmail}
                                                    onChange={(e) =>
                                                        setStudentEmail(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <Button
                                                    color="secondary"
                                                    isLoading={loading}
                                                    onPress={
                                                        handleLookupStudent
                                                    }
                                                >
                                                    Lookup
                                                </Button>
                                            </div>

                                            {/* Student Data Display */}
                                            {studentData && (
                                                <Card>
                                                    <CardBody>
                                                        <h4 className="font-semibold mb-2">
                                                            {
                                                                studentData
                                                                    .student
                                                                    .name
                                                            }{" "}
                                                            (
                                                            {
                                                                studentData
                                                                    .student
                                                                    .house
                                                            }
                                                            )
                                                        </h4>
                                                        <p className="text-lg mb-2">
                                                            <strong>
                                                                Total Points:{" "}
                                                                {
                                                                    studentData.totalPoints
                                                                }
                                                            </strong>
                                                        </p>
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                Points
                                                                Breakdown:
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {pointsCategories.map(
                                                                    (
                                                                        category,
                                                                    ) => (
                                                                        <Chip
                                                                            key={
                                                                                category.key
                                                                            }
                                                                            size="sm"
                                                                            variant="flat"
                                                                        >
                                                                            {
                                                                                category.name
                                                                            }
                                                                            :{" "}
                                                                            {studentData
                                                                                .categoryBreakdown[
                                                                                category
                                                                                    .key
                                                                            ] ||
                                                                                0}
                                                                        </Chip>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </div>
                                    )}

                                    {/* Bulk Email Input */}
                                    {mode === "bulk" && (
                                        <Textarea
                                            label="Student Emails"
                                            placeholder="Enter emails separated by commas or new lines&#10;student1@cgps.org, student2@cgps.org&#10;student3@cgps.org"
                                            rows={6}
                                            value={bulkEmails}
                                            onChange={(e) =>
                                                setBulkEmails(e.target.value)
                                            }
                                        />
                                    )}

                                    {/* CSV Upload Input */}
                                    {mode === "csv" && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Input
                                                    accept=".csv"
                                                    label="CSV File"
                                                    type="file"
                                                    onChange={
                                                        handleCsvFileChange
                                                    }
                                                />
                                                {csvFile && (
                                                    <p className="text-sm text-gray-600">
                                                        Selected: {csvFile.name}
                                                    </p>
                                                )}
                                            </div>

                                            <Card>
                                                <CardBody>
                                                    <h4 className="font-semibold mb-2">
                                                        CSV Format Options
                                                    </h4>
                                                    <div className="text-sm space-y-2">
                                                        <div>
                                                            <strong>
                                                                Simple Format:
                                                            </strong>{" "}
                                                            One email per line
                                                            <pre className="bg-gray-100 p-2 rounded mt-1">
                                                                student1@cgps.org
                                                                student2@cgps.org
                                                                student3@cgps.org
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <strong>
                                                                Advanced Format:
                                                            </strong>{" "}
                                                            Email, Category,
                                                            Points
                                                            <pre className="bg-gray-100 p-2 rounded mt-1">
                                                                Email,Category,Points
                                                                student1@cgps.org,academic,10
                                                                student2@cgps.org,behavior,5
                                                                student3@cgps.org,leadership,15
                                                            </pre>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            For simple format,
                                                            you must specify
                                                            category and points
                                                            below. For advanced
                                                            format, individual
                                                            row values will be
                                                            used.
                                                        </p>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            {csvProcessing && (
                                                <Card>
                                                    <CardBody>
                                                        <div className="space-y-2">
                                                            <p className="font-medium">
                                                                Processing
                                                                CSV...
                                                            </p>
                                                            <Progress
                                                                className="w-full"
                                                                color="primary"
                                                                value={
                                                                    csvProgress
                                                                }
                                                            />
                                                            <p className="text-sm text-gray-600">
                                                                {Math.round(
                                                                    csvProgress,
                                                                )}
                                                                % complete
                                                            </p>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </div>
                                    )}

                                    {/* Point Modification Section */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h4 className="font-semibold">
                                            Modify Points
                                        </h4>

                                        <RadioGroup
                                            label="Operation"
                                            orientation="horizontal"
                                            value={operationType}
                                            onValueChange={setOperationType}
                                        >
                                            <Radio value="add">
                                                Add Points
                                            </Radio>
                                            <Radio value="subtract">
                                                Subtract Points
                                            </Radio>
                                        </RadioGroup>

                                        <Select
                                            label="Point Category"
                                            placeholder="Select a category"
                                            value={selectedCategory}
                                            onSelectionChange={(value) =>
                                                setSelectedCategory(
                                                    Array.from(
                                                        value,
                                                    )[0] as string,
                                                )
                                            }
                                        >
                                            {pointsCategories.map(
                                                (category) => (
                                                    <SelectItem
                                                        key={category.key}
                                                        value={category.key as any}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </Select>

                                        <Input
                                            label="Points"
                                            placeholder="Enter point amount"
                                            type="number"
                                            value={pointsToModify.toString()}
                                            onChange={(e) =>
                                                setPointsToModify(
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Message Display */}
                                    {message && (
                                        <Card
                                            className={
                                                message.type === "error"
                                                    ? "border-red-500"
                                                    : "border-green-500"
                                            }
                                        >
                                            <CardBody>
                                                <p
                                                    className={
                                                        message.type === "error"
                                                            ? "text-red-600"
                                                            : "text-green-600"
                                                    }
                                                >
                                                    {message.text}
                                                </p>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Close
                                </Button>
                                <Button
                                    color="primary"
                                    isLoading={loading || csvProcessing}
                                    onPress={
                                        mode === "csv"
                                            ? handleCsvProcessing
                                            : handleModifyPoints
                                    }
                                >
                                    {mode === "csv"
                                        ? "Process CSV"
                                        : `${operationType === "add" ? "Add" : "Subtract"} Points`}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};

export default AdminStudentManager;
