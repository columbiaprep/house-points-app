import { NextApiRequest, NextApiResponse } from "next";
import { resetDatabase, type Student } from "@/firebase-configuration/firebaseDatabase";

export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    const { roster } = req.body;
    // Convert roster from csv string to array of students
    const students: Array<Student> = [];
    const lines = roster.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const [name, grade, house, id] = lines[i].split(',');
        students.push({ name, grade, house, id });
    }
    await resetDatabase(students);

    res.status(200).json({ message: "Reset successful" });
}