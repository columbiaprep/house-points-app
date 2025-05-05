'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { IndividualDocument } from '@/firebase-configuration/firebaseDb';

type Player = {
  rank: number;
  name: string;
  score: number;
  house: string;
  grade: number; 
};

const arrayOfStuff: IndividualDocument[] = [
  {
    id: '1',
    name: 'Beck',
    totalpoints: 1200,
    house: 'GreenIvy',
    grade: 11,
  },
  {
    id: '2',
    name: 'Logan',
    totalpoints: 1100,
    house: 'GoldHearts',
    grade: 11,
  },
  {
    id: '3',
    name: 'Sam',
    totalpoints: 950,
    house: 'RedPheonix',
    grade: 11,
  },
  {
    id: '4',
    name: 'Matthew',
    totalpoints: 900,
    house: 'OrangeSuperNova',
    grade: 12,
  },
];


const columnHelper = createColumnHelper<Player>();

const columns = [
  columnHelper.accessor('rank', {
    header: 'Rank',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Player',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('score', {
    header: 'Score',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('house', {
    header: 'House',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('grade', {
    header: 'Grade',
    cell: info => info.getValue(),
  }),
];

const defaultData: Player[] = arrayOfStuff.map((item, index) => ({
  rank: index + 1,
  name: item.name,
  score: item.totalpoints,
  house: item.house,
  grade: item.grade,
}));

export default function LeaderboardTable() {
  const table = useReactTable({
    data: defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getRowColor = (house: string) => {
    switch (house) {
      case 'GreenIvy':
        return 'bg-green-50';
      case 'GoldHearts':
        return 'bg-yellow-50';
      case 'RedPheonix':
        return 'bg-red-50';
      case 'OrangeSuper':
        return 'bg-orange-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">🏆 Leaderboard</h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white">
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
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={`${getRowColor(row.original.house)} hover:bg-opacity-75 transition`}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}