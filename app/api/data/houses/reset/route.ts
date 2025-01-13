'use server';
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

import {
  resetDatabase,
  type Student,
} from '@/firebase-configuration/firebaseDatabaseServer';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const { roster } = JSON.parse(body);

  const parseResult = Papa.parse<Student>(roster, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parseResult.errors.length > 0) {
    return NextResponse.json(
      { error: "Error parsing CSV" },
      { status: 400 }
    );
  }

  const students: Array<Student> = parseResult.data;

  try {
    await resetDatabase(students);
    return NextResponse.json({ status: 200 }, { status: 200 });
  } catch (error) {
    console.error('Failed to reset database:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}