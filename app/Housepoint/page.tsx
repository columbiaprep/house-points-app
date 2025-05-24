'use client';
import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
//Importing the firebase configuration for the IndividualDocument
import { IndividualDocument } from '@/firebase-configuration/firebaseDb';

// Define the type for the student data dummy data for now of course until I can string through the firebase database
type Student = {
  rank: number;
  name: string;
  score: number;
  house: string;
  grade: number;
};

// Define the type for the individual document again dummy data for now
const arrayOfStuff: IndividualDocument[] = [
  { id: '1', name: 'Beck', totalpoints: 1200, house: 'Green Ivy', grade: 11 },
  { id: '2', name: 'Logan', totalpoints: 1100, house: 'Gold House', grade: 11 },
  { id: '3', name: 'Sam', totalpoints: 950, house: 'Red Pheonix', grade: 11 },
  { id: '4', name: 'Matthew', totalpoints: 900, house: 'Orange Supernova', grade: 12 },
];

// Create a column helper for the Student type
const columnHelper = createColumnHelper<Student>();

// Define columns for the table each with header display name and cell rendering function
// The cell rendering function is used to display the data in the table cells
const columns = [
  columnHelper.accessor('rank', { header: 'Rank', cell: info => info.getValue() }),
  columnHelper.accessor('name', { header: 'Student', cell: info => info.getValue() }),
  columnHelper.accessor('score', { header: 'Score', cell: info => info.getValue() }),
  columnHelper.accessor('house', { header: 'House', cell: info => info.getValue() }),
  columnHelper.accessor('grade', { header: 'Grade', cell: info => info.getValue() }),
];

// Convert the array of individual documents to the Student type
const defaultData: Student[] = arrayOfStuff.map((item, index) => ({
  rank: index + 1,
  name: item.name,
  score: item.totalpoints,
  house: item.house,
  grade: item.grade,
}));

// Theme settings for different houses blue, orange, purple, red, silver, green, gold, pink
// Each theme has a gradient and a hover effect to enhance the UI
const themes: Record<string, { gradient: string; hover: string; glowColor: string }> = {
  'Blue Thunder': {
    gradient: 'from-blue-500 via-indigo-500 to-sky-500',
    hover: 'hover:bg-blue-100',
    glowColor: 'rgba(59, 130, 246, 0.8)',
  },
  'Orange Supernova': {
    gradient: 'from-orange-500 via-yellow-500 to-red-500',
    hover: 'hover:bg-orange-100',
    glowColor: 'rgba(251, 146, 60, 0.8)',
  },
  'Purple Reign': {
    gradient: 'from-purple-500 via-pink-500 to-indigo-500',
    hover: 'hover:bg-purple-100',
    glowColor: 'rgba(168, 85, 247, 0.8)',
  },
  'Red Pheonix': {
    gradient: 'from-red-500 via-yellow-400 to-pink-500',
    hover: 'hover:bg-red-100',
    glowColor: 'rgba(239, 68, 68, 0.8)',
  },
  'Silver Knights': {
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    hover: 'hover:bg-gray-100',
    glowColor: 'rgba(156, 163, 175, 0.8)',
  },
  'Green Ivy': {
    gradient: 'from-green-500 via-lime-500 to-emerald-500',
    hover: 'hover:bg-green-100',
    glowColor: 'rgba(34, 197, 94, 0.8)',
  },
  'Gold House': {
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    hover: 'hover:bg-yellow-100',
    glowColor: 'rgba(234, 179, 8, 0.8)',
  },
  'Pink Panther': {
    gradient: 'from-pink-400 via-pink-500 to-rose-500',
    hover: 'hover:bg-pink-100',
    glowColor: 'rgba(236, 72, 153, 0.8)',
  },
};

// This component renders a leaderboard table with the starting theme being Green Ivy
export default function LeaderboardTable() {
  const [selectedTheme, setSelectedTheme] = useState<string>('Green Ivy');

  const table = useReactTable({
    data: defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const theme = themes[selectedTheme];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto">
      {/* Table Area & Theme Selector is Below Further Changes Need To Be Made*/}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">🏆 Leaderboard</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`bg-gradient-to-r ${theme.gradient} text-white`}>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-sm font-semibold tracking-wider"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map(row => {
                const rank = row.original.rank;
                const isTopRank = rank === 1;

                const cells = row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ));

                // Apply glowing animation to the top-ranked row and this can be changed to any rank you want showing where you place in the leaderboard
                return (
                  <tr
                    key={row.id}
                    className={`${theme.hover} transition ${
                      isTopRank ? 'animate-glow ring-2 ring-green-400' : ''
                    }`}
                  >
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="w-full md:w-64 mt-6 md:mt-0">
        <label className="block mb-2 text-sm font-semibold text-gray-700">🎨 Select Theme:</label>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(themes).map((themeName) => (
            <option key={themeName} value={themeName}>
              {themeName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}