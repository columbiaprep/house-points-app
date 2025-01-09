import { fetchIndividual } from "@/firebase-configuration/firebaseDatabaseServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const id: string = req.nextUrl.pathname.split('/').pop() || '';
    const data = await fetchIndividual(id);
    return NextResponse.json({ status: 200, data: data });
  } catch (error) {
    console.error('Error fetching individual:', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
  }
}