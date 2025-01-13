'use server';
import { NextRequest, NextResponse } from 'next/server';

import {
  fetchAllIndividuals,
  writeToIndividualData,
} from '@/firebase-configuration/firebaseDatabaseServer';

export async function GET() {
  try {
    const data = await fetchAllIndividuals();
    const plainData = JSON.parse(JSON.stringify(data));

    return NextResponse.json({ status: 200, data: plainData });
  } catch (error) {
    console.error('Error fetching individuals:', error);

    return NextResponse.json({ status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { points, id, category }: { points: number; id: string; category: string } = await request.json();

    if (!points || !id || !category) {
      return NextResponse.json(
        { error: "Please provide points, id, and category" },
        { status: 400 }
      );
    }

    await writeToIndividualData(category, id, points);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('Failed to add points:', error);

    return NextResponse.json({ status: 500, error: 'Internal Server Error' });
  }
}