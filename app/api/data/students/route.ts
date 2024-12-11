import { fetchAllIndividuals, writeToIndividualData } from "@/firebase-configuration/firebaseDatabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await fetchAllIndividuals();
    const plainData = JSON.parse(JSON.stringify(data));
    return NextResponse.json({ status: 200, data: plainData });
  } catch (error) {
    console.error('Error fetching individuals:', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
      const { points, id, category } = await req.json();

      writeToIndividualData(category, id, points)

      return new NextResponse(JSON.stringify({ status: 200, message: 'Points added successfully' }), {
          headers: { 'Content-Type': 'application/json' },
      });
  } catch (error) {
      console.error('Failed to add points:', error);
      return new NextResponse(JSON.stringify({ status: 500, error: 'Failed to add points' }), {
          headers: { 'Content-Type': 'application/json' },
      });
  }
}