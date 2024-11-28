import { fetchIndividual, writeToIndividualData } from "@/firebase-configuration/firebaseDatabase";
import { NextRequest, NextResponse } from "next/server";

// For individual student data
export async function GET(req: NextRequest) {
    const id: string = req.nextUrl.pathname.split('/').pop() || '';
    const data = await fetchIndividual(id);
    return new NextResponse(JSON.stringify({ status: 200, data: data }), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function POST(req: NextRequest) {
    // Your POST logic here
    return new NextResponse(JSON.stringify({ status: 200 }), {
        headers: { 'Content-Type': 'application/json' },
    });
}