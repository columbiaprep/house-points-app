import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "@nextui-org/react";

import {
    fetchPointCategories,
    addPointCategory,
    editPointCategory,
    deletePointCategory,
    PointCategory,
} from "@/firebase-configuration/firebaseDb";

const AdminPointCategories = () => {
    const [categories, setCategories] = useState<PointCategory[]>([]);
    const [newCategory, setNewCategory] = useState<PointCategory>({
        key: "",
        name: "",
        description: "",
    });

    useEffect(() => {
        const loadCategories = async () => {
            const fetchedCategories = await fetchPointCategories();

            setCategories(fetchedCategories);
        };

        loadCategories();
    }, []);

    const handleAddCategory = async () => {
        await addPointCategory(newCategory);
        setCategories([...categories, newCategory]);
        setNewCategory({ key: "", name: "", description: "" });
    };

    const handleEditCategory = async (
        id: string,
        updatedCategory: Partial<PointCategory>,
    ) => {
        await editPointCategory(id, updatedCategory);
        setCategories(
            categories.map((cat) =>
                cat.key === id ? { ...cat, ...updatedCategory } : cat,
            ),
        );
    };

    const handleDeleteCategory = async (id: string) => {
        await deletePointCategory(id);
        setCategories(categories.filter((cat) => cat.key !== id));
    };

    return (
        <Card>
            <h1>Manage Point Categories</h1>
            <div>
                <Input
                    placeholder="Key"
                    type="text"
                    value={newCategory.key}
                    onChange={(e) =>
                        setNewCategory({ ...newCategory, key: e.target.value })
                    }
                />
                <Input
                    placeholder="Name"
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                    }
                />
                <Input
                    placeholder="Description"
                    type="text"
                    value={newCategory.description}
                    onChange={(e) =>
                        setNewCategory({
                            ...newCategory,
                            description: e.target.value,
                        })
                    }
                />
                <Button onClick={handleAddCategory}>Add Category</Button>
            </div>
            <ul>
                {categories.map((category) => (
                    <li key={category.key}>
                        <Input
                            type="text"
                            value={category.name}
                            onChange={(e) =>
                                handleEditCategory(category.key, {
                                    name: e.target.value,
                                })
                            }
                        />
                        <Input
                            type="text"
                            value={category.description}
                            onChange={(e) =>
                                handleEditCategory(category.key, {
                                    description: e.target.value,
                                })
                            }
                        />
                        <Button
                            onClick={() => handleDeleteCategory(category.key)}
                        >
                            Delete
                        </Button>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default AdminPointCategories;
