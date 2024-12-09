import { NextApiRequest, NextApiResponse } from "next";
import { resetDatabase, type Student } from "@/firebase-configuration/firebaseDatabase";
import Papa from "papaparse";

export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    const { roster } = req.body;

    const parseResult = Papa.parse<Student>(roster, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    if (parseResult.errors.length > 0) {
        return res.status(400).json({ message: "Error parsing CSV", errors: parseResult.errors });
    }

    const students: Array<Student> = parseResult.data;

    await resetDatabase(students);

    res.status(200).json({ message: "Reset successful" });
};