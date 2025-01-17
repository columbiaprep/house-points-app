import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useState } from 'react';

import { writeToIndividualData } from '@/firebase-configuration/firebaseDb';

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

    studentIds.forEach(async (student) => {
      await writeToIndividualData(category, student, points);
    });
  };

  return (
    <div className="flex">
      <Card
        isBlurred
        className="point-form-card border-none shadow-lg p-6 w-5/6 h-full"
      >
        <CardBody>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-center">
              Import A Roster of Students & Value of Points to Add
            </h2>
            <p className="text-center">File must have only Student IDs</p>
            <Input
              required
              accept=".csv"
              className="p-2 rounded"
              type="file"
              onChange={handleFileChange}
            />
            <Select
              className="p-2 rounded"
              label="Select a category"
              onSelectionChange={(value) =>
                setCategory(value.currentKey as string)
              }
            >
              <SelectItem key="beingGoodPts">Caught Being Good</SelectItem>
              <SelectItem key="attendingEventsPts">Attending Events</SelectItem>
              <SelectItem key="sportsTeamPts">Sports Team</SelectItem>
            </Select>
            <Input
              required
              className="p-2 rounded"
              placeholder="Points to Add"
              type="number"
              onChange={(e) => setPoints(parseInt(e.target.value))}
            />
            <Button onPress={handleSubmission}>Add Points</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminMassPointsForm;
