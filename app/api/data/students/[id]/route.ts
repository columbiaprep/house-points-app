'use server';
import { NextRequest, NextResponse } from 'next/server';
import { fetchIndividual } from '@/firebase-configuration/firebaseDatabaseServer';

export async function GET(request: NextRequest) {
  const id: string = request.nextUrl.pathname.split('/').pop() || '';

  if (!id) {
    return NextResponse.json(
      { error: "ID is required" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchIndividual(id);

    if (!data) {
      return NextResponse.json(
        { error: "Individual not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching individual:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}