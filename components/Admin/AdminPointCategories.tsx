import {
    Card,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    TableColumn,
    ModalContent,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { FaPenToSquare } from "react-icons/fa6";

import {
    getPointCategories,
    updatePointCategory,
    PointCategories,
    addPointCategory,
} from "@/firebase-configuration/firebaseDb";

const AdminPointCategories = () => {
    const [fetchedPointCategories, setFetchedPointCategories] = useState<
        PointCategories[]
    >([]);
    const [selectedCategory, setSelectedCategory] =
        useState<PointCategories | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCategory, setNewCategory] = useState<PointCategories>({
        id: "",
        name: "",
        description: "",
        key: "",
    });

    useEffect(() => {
        const fetchPointCategories = async () => {
            const pointCategories = await getPointCategories();

            setFetchedPointCategories(pointCategories);
        };

        fetchPointCategories();
    }, []);

    const handleAddCategory = async () => {
        await addPointCategory(newCategory);
        setCategories([...categories, newCategory]);
        setNewCategory({ key: "", name: "", description: "" });
    };

    const handleSave = async () => {
        if (selectedCategory) {
            await updatePointCategory(selectedCategory.id, selectedCategory);
            const updatedCategories = await getPointCategories();

            setFetchedPointCategories(updatedCategories);
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        await deletePointCategory(id);
        setCategories(categories.filter((cat) => cat.key !== id));
    };

    return (

        <div className="flex">
            <Card
                isBlurred
                className="border-none bg-background/60 dark:bg-default-100/50 shadow-lg p-6 w-5/6"
            >
                <h2 className="text-2xl font-bold text-center">
                    Admin Point Categories
                </h2>
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
                                    <Button
                                        className="px-0 max-w-[40px] bg-white hover:bg-gray-200"
                                        onPress={() =>
                                            handleEditClick(category)
                                        }
                                    >
                                        <FaPenToSquare />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex justify-center mt-4">
                    <Button
                        color={"success"}
                        onPress={() => setIsAddModalOpen(true)}
                    >
                        Add Point Category
                    </Button>
                </div>
            </Card>

            {/* add category modal */}
            {isAddModalOpen && (
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                >
                    <ModalContent>
                        <ModalHeader>Add Point Category</ModalHeader>
                        <ModalBody>
                            <Input
                                label="Name"
                                value={newCategory.name}
                                onChange={(e) =>
                                    setNewCategory({
                                        ...newCategory,
                                        name: e.target.value,
                                    })
                                }
                            />
                            <Input
                                label="Description"
                                value={newCategory.description}
                                onChange={(e) =>
                                    setNewCategory({
                                        ...newCategory,
                                        description: e.target.value,
                                    })
                                }
                            />
                            <Input
                                label="Key"
                                placeholder="No Spaces"
                                value={newCategory.key}
                                onChange={(e) =>
                                    setNewCategory({
                                        ...newCategory,
                                        key: e.target.value,
                                    })
                                }
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color={"success"}
                                onPress={async () => {
                                    // Add logic to save the new category
                                    await addPointCategory(newCategory);
                                    const updatedCategories =
                                        await getPointCategories();

                                    setFetchedPointCategories(
                                        updatedCategories,
                                    );
                                    setNewCategory({
                                        id: "",
                                        name: "",
                                        description: "",
                                        key: "",
                                    });
                                    setIsAddModalOpen(false);
                                }}
                            >
                                Save
                            </Button>
                            <Button
                                color={"danger"}
                                onPress={() => setIsAddModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}

            {/* edit category modal */}
            {isEditModalOpen && selectedCategory && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                >
                    <ModalContent>
                        <ModalHeader>
                            <h3>
                                Edit Point Category - {selectedCategory.name}
                            </h3>
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                label="Name"
                                value={selectedCategory.name}
                                onChange={(e) =>
                                    handleInputChange("name", e.target.value)
                                }
                            />
                            <Input
                                label="Description"
                                value={selectedCategory.description}
                                onChange={(e) =>
                                    handleInputChange(
                                        "description",
                                        e.target.value,
                                    )
                                }
                            />
                            <Input
                                label="Key"
                                placeholder="No Spaces"
                                value={selectedCategory.key}
                                onChange={(e) =>
                                    handleInputChange("key", e.target.value)
                                }
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color={"success"} onPress={handleSave}>
                                Save
                            </Button>
                            <Button
                                color={"danger"}
                                onPress={() => setIsEditModalOpen(false)}
                            >
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