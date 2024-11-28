"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Autocomplete, AutocompleteItem, Select, SelectItem, Input, Button } from '@nextui-org/react';
import { Card, CardBody } from '@nextui-org/card';

interface StudentData {
  id: string;
  name: string;
  points: number[];
  rank: number;
  house: string;
  grade: number;
}

interface HouseData {
  id: string;
  house: string;
  points: number[];
  rank: number;
}

const getAllIndividualData = async () => {
  try {
    const response = await axios.get('/api/data/students');
    if (response.status !== 200) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch individual data:', error);
    return null;
  }
};

const getAllHousesLeaderboardData = async () => {
  try {
    const response = await axios.get('/api/data/houses');
    if (response.status !== 200) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch houses leaderboard data:', error);
    return null;
  }
};

const AdminPointsForm = () => {
  const [individualData, setIndividualData] = useState<StudentData[]>([]);
  const [housesData, setHousesData] = useState<HouseData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState(0);

  useEffect(() => {
    getAllIndividualData().then((data) => setIndividualData(data));
    getAllHousesLeaderboardData().then((data) => setHousesData(data));
  }, []);

  const handleAddPoints = () => {
    // To be implemented
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card isBlurred className="point-form-card border-none bg-background/60 dark:bg-default-100/50 shadow-lg p-6 w-3/6">
        <CardBody>
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-center">Add Points</h2>
            <div>
              <h3 className="text-xl font-semibold">By Student</h3>
              <Autocomplete
                className="w-full"
                label="Student Name"
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                {individualData.map((student) => (
                  <AutocompleteItem key={student.id} value={student.name}>
                    {student.name}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
              <Input
                type="number"
                label="Points to Add"
                className="mt-4 w-full"
                onChange={(e) => setPointsToAdd(parseInt(e.target.value))}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">By House</h3>
              <Select
                label="Select a House"
                className="w-full"
                onChange={(e) => setSelectedHouse(e.target.value)}
              >
                {housesData.map((house) => (
                  <SelectItem key={house.id} value={house.house}>
                    {house.house}
                  </SelectItem>
                ))}
              </Select>
              <Input
                type="number"
                label="Points to Add"
                className="mt-4 w-full"
                onChange={(e) => setPointsToAdd(parseInt(e.target.value))}
              />
            </div>
            <Button className="mt-6 w-full" onClick={handleAddPoints}>
              Add Points
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminPointsForm;