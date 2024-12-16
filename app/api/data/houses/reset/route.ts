import { NextRequest, NextResponse } from "next/server";
import { resetDatabase, type Student } from "@/firebase-configuration/firebaseDatabase";
import Papa from "papaparse";

export const POST = async (req: NextRequest) => {
    const body = await req.text();
    const { roster } = JSON.parse(body);

    const parseResult = Papa.parse<Student>(roster, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    if (parseResult.errors.length > 0) {
        return NextResponse.json({ message: "Error parsing CSV", errors: parseResult.errors }, { status: 400 });
    }

    const students: Array<Student> = parseResult.data;

    await resetDatabase(students);

    return NextResponse.json({ message: "Reset successful" }, { status: 200 });
};