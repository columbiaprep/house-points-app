import { fetchAllHouses, writeToHouseData } from "@/firebase-configuration/firebaseDatabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await fetchAllHouses();
    const plainData = JSON.parse(JSON.stringify(data));
    return NextResponse.json({ status: 200, data: plainData });
  } catch (error) {
    console.error('Error fetching houses:', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { points, category, id } = await req.json();
    await writeToHouseData(category, id, points);

    return NextResponse.json({ status: 200, message: 'Points added successfully' });
  } catch (error) {
    console.error('Failed to add points:', error);
    return NextResponse.json({ status: 500, error: 'Failed to add points' }, { status: 500 });
  }
}