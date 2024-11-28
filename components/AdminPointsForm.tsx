"use client"
import { useEffect, useState } from 'react';
import { Autocomplete, AutocompleteItem, Select, SelectItem, Input } from '@nextui-org/react';
import axios from 'axios';

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
    console.log(response.data);
    if (response.status !== 200) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response.data;
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
  return (
    
  )
 
};

export default AdminPointsForm;