"use server";
import { NextRequest, NextResponse } from 'next/server';
import { fetchAllHouses, writeToHouseData } from '@/firebase-configuration/firebaseDatabaseServer';

export async function GET() {
  try {
    const data = await fetchAllHouses();
    const plainData = JSON.parse(JSON.stringify(data));

    return NextResponse.json({ data: plainData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching houses:', error);

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { points, category, id }: { points: number; category: string; id: string } = await request.json();

    if (!points || !category || !id) {
      return NextResponse.json(
        { error: "Please provide points, category, and id" },
        { status: 400 }
      );
    }

    await writeToHouseData(category, id, points);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error('Failed to add points:', error);

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}