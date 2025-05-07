import { getPointCategories, updatePointCategory, PointCategories } from "@/firebase-configuration/firebaseDb";
import { Card, Table, TableHeader, TableBody, TableRow, TableCell, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, TableColumn, ModalContent } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FaPenToSquare } from "react-icons/fa6";

const AdminPointCategories = () => {
    const [fetchedPointCategories, setFetchedPointCategories] = useState<PointCategories[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<PointCategories | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchPointCategories = async () => {
            const pointCategories = await getPointCategories();
            setFetchedPointCategories(pointCategories);
        };
        fetchPointCategories();
    }, []);

    const handleEditClick = (category: PointCategories) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    const handleSave = async () => {
        if (selectedCategory) {
            await updatePointCategory(selectedCategory.id, selectedCategory);
            const updatedCategories = await getPointCategories();
            setFetchedPointCategories(updatedCategories);
            setIsEditModalOpen(false);
        }
    };

    const handleInputChange = (field: keyof PointCategories, value: string) => {
        if (selectedCategory) {
            setSelectedCategory({ ...selectedCategory, [field]: value });
        }
    };

    return (
        <div className="flex">
            <Card isBlurred className="border-none bg-background/60 dark:bg-default-100/50 shadow-lg p-6 w-5/6">
                <h2 className="text-2xl font-bold text-center">Admin Point Categories</h2>
                <p className="text-center">Manage point categories here.</p>
                <Table>
                    <TableHeader>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Description</TableColumn>
                        {/* <TableColumn>Key</TableColumn> */}
                        <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {fetchedPointCategories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.description}</TableCell>
                                {/* <TableCell>{category.key}</TableCell> */}
                                <TableCell>
                                    <Button className="px-0 max-w-[40px] bg-white hover:bg-gray-200" onPress={() => handleEditClick(category)}><FaPenToSquare /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {isEditModalOpen && selectedCategory && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                    <ModalContent>
                        <ModalHeader>
                            <h3>Edit Point Category - {selectedCategory.name}</h3>
                        </ModalHeader> 
                        <ModalBody>
                            <Input
                                label="Name"
                                value={selectedCategory.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                            <Input
                                label="Description"
                                value={selectedCategory.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                            <Input
                                label="Key"
                                placeholder="No Spaces"
                                value={selectedCategory.key}
                                onChange={(e) => handleInputChange("key", e.target.value)}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color={"success"} onPress={handleSave}>Save</Button>
                            <Button onPress={() => setIsEditModalOpen(false)} color={"danger"}>
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
};

export default AdminPointCategories;