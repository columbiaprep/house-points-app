"use client"
import { useEffect, useState } from 'react';
import { getAllHousesLeaderboardData, getAllIndividualData } from '@/firebase-configuration/firebaseDatabase';
import { Autocomplete, AutocompleteItem, Select, SelectItem, Input } from '@nextui-org/react';

interface StudentData {
  name: string;
  points: number[];
  rank: number;
  house: string;
  grade: number;
}

interface HouseData {
  house: string;
  points: number[];
  rank: number;
}

const AdminPointsForm = () => {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [housesData, setHousesData] = useState<HouseData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sData = await getAllIndividualData();
        const hData = await getAllHousesLeaderboardData();
        setStudentsData(sData);
        setHousesData(hData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedHouse, setSelectedHouse] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState(0);

  return (
    <div className="form">
      Add Points by Student
      <Autocomplete
        className="max-w-xs"
        label="Student Name"
        onChange={(e) => setSelectedStudent(e.target.value)}
      >
        {studentsData.map((student) => (
          <AutocompleteItem key={student.name} value={student.name}>
            {student.name}
          </AutocompleteItem>
        ))}
      </Autocomplete>
      <Input type="number" label="Points to Add" onChange={(e) => setPointsToAdd(parseInt(e.target.value))} />
      Add Points by House
      <Select
        label="Select a House"
        className="max-w-xs"
        onChange={(e) => setSelectedHouse(e.target.value)}
      >
        {housesData.map((house) => (
          <SelectItem key={house.house}>
            {house.house}
          </SelectItem>
        ))}
      </Select>
      <Input type="number" label="Points to Add" onChange={(e) => setPointsToAdd(parseInt(e.target.value))} />
      <button onClick={() => {
        // Add points using function
      }}>Add Points</button>
    </div>
  );
};

export default AdminPointsForm;