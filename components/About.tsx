import { Modal, ModalContent, ModalHeader, ModalBody, Avatar, Card, CardBody } from "@heroui/react";

interface Developer {
    name: string;
    photoUrl?: string;
    contribution: string;
}

interface AboutModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onOpenChange }) => {
    const developers: Developer[] = [
        {
            name: `Sebastian R., '26`,
            photoUrl: "/dev-photos/sebastianr.jpg",
            contribution: "Contributed to frontend development and UI/UX design."
        },
        {
            name: `Beck N., '26`,
            photoUrl: "/dev-photos/beckn.jpg",
            contribution: "Contributed to frontend development and UI/UX design."
        },
        {
            name: "Sam Z., '25",
            photoUrl: "/dev-photos/samz.jpg",
            contribution: "Built backend infrastructure, admin interface and database architecture."
        },
                {
            name: "Ms. Aubrey Schott, Faculty Advisor",
            photoUrl: "/dev-photos/aschott.png",
            contribution: "Project Coordinator. Revised existing code and rewrote admin panel features."
        }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="2xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">About House Points System</h2>
                </ModalHeader>
                <ModalBody className="pb-6">
                    <div className="space-y-6">
                        {/* Project Description Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 leading-relaxed">
                                    This house points tracking system was developed for Columbia Grammar & Preparatory School
                                    to manage inter-house competitions and student achievements. The application provides
                                    real-time leaderboards, point management, and administrative tools for faculty and students.
                                </p>
                            </div>
                        </div>

                        {/* Developers Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Development Team</h3>
                            <div className="grid gap-4">
                                {developers.map((developer, index) => (
                                    <Card key={index} className="bg-gray-50">
                                        <CardBody className="p-4">
                                            <div className="flex items-start gap-4">
                                                <Avatar
                                                    src={developer.photoUrl}
                                                    size="lg"
                                                    isBordered
                                                    className="flex-shrink-0"
                                                />
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-semibold text-lg mb-1">
                                                        {developer.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {developer.contribution}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};