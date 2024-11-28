import { fetchAllIndividuals } from "@/firebase-configuration/firebaseDatabase";
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