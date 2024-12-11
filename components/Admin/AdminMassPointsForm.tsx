import { Button, Card, CardBody, Input, Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import { useState } from "react";

const AdminMassPointsForm = () => {
    const [fileContents, setFileContents] = useState<string>('');
    const [points, setPoints] = useState<number>(0);
    const [category, setCategory] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setFileContents(content);
            };
            reader.readAsText(file);
        }
    };

    const handleSubmission = async () => {
        const studentIds = fileContents.split('\n').map((line) => line.trim());
        studentIds.forEach(async student => {
            await axios.post('api/data/students', { points: points, id: student, category: category })
        });
    }
    return (
        <div className="flex w-[900px]">
            <Card isBlurred className="point-form-card border-none bg-background/60 dark:bg-default-100/50 shadow-lg p-6 w-3/6">
                <CardBody>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-center">Import A Roster of Students & Value of Points to Add</h2>
                        <p className="text-center">File must have only Student IDs</p>
                        <Input
                            onChange={handleFileChange}
                            required
                            className="p-2 rounded"
                            type="file"
                            accept=".csv"
                        />
                        <Select
                            label="Select a category"
                            className="p-2 rounded"
                            onSelectionChange={(value) => setCategory(value.currentKey as string)}
                        >

                            <SelectItem key="beingGoodPts">Caught Being Good</SelectItem>
                            <SelectItem key="attendingEventsPts">Attending Events</SelectItem>
                            <SelectItem key="sportsTeamPts">Sports Team</SelectItem>



                        </Select>
                        <Input required type="number" className="p-2 rounded" placeholder="Points to Add" />
                        <Button onClick={handleSubmission}>Add Points</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

export default AdminMassPointsForm;