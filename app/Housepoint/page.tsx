'use client';

//Dependencies 
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'; // TanStack Table: headless table logic
import { IndividualDocument } from '@/firebase-configuration/firebaseDb'; // Custom type from Firebase config
import GlowingEffect from './glow'; // Custom component for glowing row effect

// Type definition for a leaderboard row (used throughout)
type Player = {
  id: string;
  rank: number;
  name: string;
  score: number;
  house: string;
  grade: number;
};

// Sample data NOTE: Swap this with database data
const arrayOfStuff: IndividualDocument[] = [
  { id: '1', name: 'Beck', totalpoints: 1200, house: 'GreenIvy', grade: 11 },
  { id: '2', name: 'Logan', totalpoints: 1100, house: 'GoldHearts', grade: 11 },
  { id: '3', name: 'Sam', totalpoints: 950, house: 'RedPhoenix', grade: 11 },
  { id: '4', name: 'Matthew', totalpoints: 900, house: 'OrangeSuperNova', grade: 12 },
];

// Define table columns using TanStack helper
const columnHelper = createColumnHelper<Player>();
const columns = [
  columnHelper.accessor('rank',  { header: 'Rank',  cell: info => info.getValue() }),
  columnHelper.accessor('name',  { header: 'Player',cell: info => info.getValue() }),
  columnHelper.accessor('score', { header: 'Score', cell: info => info.getValue() }),
  columnHelper.accessor('house', { header: 'House', cell: info => info.getValue() }),
  columnHelper.accessor('grade', { header: 'Grade', cell: info => info.getValue() }),
];

// Convert mock data to shape expected by table (adds rank and renames score)
const defaultData: Player[] = arrayOfStuff.map((item, index) => ({
  id: item.id,
  rank: index + 1,
  name: item.name,
  score: item.totalpoints,
  house: item.house,
  grade: item.grade,
}));

// Header gradient themes per house can be changed if color is not good looking 
// NOTE: This is a gradient from tailwindcss
// Map of house names to Tailwind gradient background styles
const themeGradient: Record<string, string> = {
  GreenIvy:        'from-green-400 via-green-500 to-green-600',
  GoldHearts:      'from-yellow-400 via-yellow-500 to-yellow-600',
  RedPhoenix:      'from-red-400 via-red-500 to-red-600',
  OrangeSuperNova: 'from-orange-400 via-orange-500 to-orange-600',
  PinkPanther:     'from-pink-400 via-pink-500 to-pink-600',
  BlueThunder:     'from-blue-400 via-blue-500 to-blue-600',
  PurpleRain:      'from-purple-400 via-purple-500 to-purple-600',
  SilverKnights:   'from-gray-400 via-gray-500 to-gray-600',
};

export default function LeaderboardTable() {
  const [selectedHouse, setSelectedHouse] = useState<string>('GreenIvy'); // Theme color selector
  const table = useReactTable({
    data: defaultData,  // Table data
    columns,           // Column definitions
    getCoreRowModel: getCoreRowModel(), // Basic row rendering (no sorting/filtering yet)
  });

  // Every row uses the same background based on selectedHouse this will be changed for the database
  const getRowColor = () => {
    switch (selectedHouse) {
      case 'GreenIvy':        return 'bg-green-50';
      case 'GoldHearts':      return 'bg-yellow-50';
      case 'RedPhoenix':      return 'bg-red-50';
      case 'OrangeSuperNova': return 'bg-orange-50';
      case 'PinkPanther':     return 'bg-pink-50';
      case 'BlueThunder':     return 'bg-blue-50';
      case 'PurpleRain':      return 'bg-purple-50';
      case 'SilverKnights':   return 'bg-gray-50';
      default:                return 'bg-white';
    }
  };

   // Get gradient for header based on selected house
  const headerGradient = themeGradient[selectedHouse] || 'from-gray-400 via-gray-500 to-gray-600';
  const highlightId    = '2'; // ID of the row you want to glow can be changed to any id from the database of dummy data

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Theme selector */}
      <div className="flex justify-center items-center mb-4">
        <label htmlFor="house-select" className="mr-2 font-semibold">
          Theme:
        </label>
        <select
          id="house-select"
          value={selectedHouse}
          onChange={e => setSelectedHouse(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {Object.keys(themeGradient).map(house => (
            <option key={house} value={house}>{house}</option>
          ))}
        </select>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">🏆 Leaderboard</h2>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header with dynamic gradient or can be changed to solid color */}
          <thead className={`bg-gradient-to-r ${headerGradient} text-white`}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-sm font-semibold tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body with uniform row color not seperate houses & one glowing row for individual statuss */}
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map(row => {
              const tr = (
                <tr
                  key={row.id}
                  className={`${getRowColor()} hover:bg-opacity-75 transition rounded-lg`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );

              return row.original.id === highlightId ? (
                <GlowingEffect key={row.id} house={selectedHouse}>
                  {tr}
                </GlowingEffect>
              ) : (
                tr
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
