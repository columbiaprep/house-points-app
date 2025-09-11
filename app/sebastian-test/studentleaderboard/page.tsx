"use client";
import "@questlabs/react-sdk/dist/style.css";

const fakeStudentData = {
    students: [
        {
            name: "Alice Smith",
            grade: 10,
            house: "Green Ivy",
            attendancePoints: 25,
            eventsPoints: 30,
            participationPoints: 20,
            servicePoints: 15,
            supportPoints: 18,
            totalPoints: 108,
        },
        {
            name: "Bob Johnson",
            grade: 11,
            house: "Red Phoenix",
            attendancePoints: 30,
            eventsPoints: 35,
            participationPoints: 25,
            servicePoints: 20,
            supportPoints: 22,
            totalPoints: 132,
        },
        {
            name: "Charlie Williams",
            grade: 9,
            house: "Gold Hearts",
            attendancePoints: 20,
            eventsPoints: 28,
            participationPoints: 18,
            servicePoints: 12,
            supportPoints: 15,
            totalPoints: 93,
        },
        {
            name: "David Brown",
            grade: 12,
            house: "Blue Thunder",
            attendancePoints: 35,
            eventsPoints: 40,
            participationPoints: 30,
            servicePoints: 25,
            supportPoints: 28,
            totalPoints: 158,
        },
        {
            name: "Eve Davis",
            grade: 10,
            house: "Orange Supernova",
            attendancePoints: 28,
            eventsPoints: 32,
            participationPoints: 22,
            servicePoints: 18,
            supportPoints: 20,
            totalPoints: 120,
        },
        {
            name: "Frank Miller",
            grade: 11,
            house: "Silver Knights",
            attendancePoints: 32,
            eventsPoints: 38,
            participationPoints: 28,
            servicePoints: 22,
            supportPoints: 25,
            totalPoints: 145,
        },
        {
            name: "Grace Wilson",
            grade: 9,
            house: "Pink Panthers",
            attendancePoints: 22,
            eventsPoints: 26,
            participationPoints: 19,
            servicePoints: 14,
            supportPoints: 17,
            totalPoints: 98,
        },
        {
            name: "Henry Moore",
            grade: 12,
            house: "Purple Reign",
            attendancePoints: 30,
            eventsPoints: 36,
            participationPoints: 26,
            servicePoints: 21,
            supportPoints: 24,
            totalPoints: 137,
        },
        {
            name: "Isabella Taylor",
            grade: 10,
            house: "Green Ivy",
            attendancePoints: 26,
            eventsPoints: 31,
            participationPoints: 21,
            servicePoints: 16,
            supportPoints: 19,
            totalPoints: 113,
        },
        {
            name: "Jack Anderson",
            grade: 11,
            house: "Red Phoenix",
            attendancePoints: 31,
            eventsPoints: 36,
            participationPoints: 26,
            servicePoints: 21,
            supportPoints: 23,
            totalPoints: 137,
        },
        {
            name: "Katie Thomas",
            grade: 9,
            house: "Gold Hearts",
            attendancePoints: 21,
            eventsPoints: 29,
            participationPoints: 19,
            servicePoints: 13,
            supportPoints: 16,
            totalPoints: 98,
        },
        {
            name: "Liam Jackson",
            grade: 12,
            house: "Blue Thunder",
            attendancePoints: 36,
            eventsPoints: 41,
            participationPoints: 31,
            servicePoints: 26,
            supportPoints: 29,
            totalPoints: 163,
        },
        {
            name: "Mia White",
            grade: 10,
            house: "Orange Supernova",
            attendancePoints: 29,
            eventsPoints: 33,
            participationPoints: 23,
            servicePoints: 19,
            supportPoints: 21,
            totalPoints: 125,
        },
        {
            name: "Noah Harris",
            grade: 11,
            house: "Silver Knights",
            attendancePoints: 33,
            eventsPoints: 39,
            participationPoints: 29,
            servicePoints: 23,
            supportPoints: 26,
            totalPoints: 150,
        },
        {
            name: "Olivia Martin",
            grade: 9,
            house: "Pink Panthers",
            attendancePoints: 23,
            eventsPoints: 27,
            participationPoints: 20,
            servicePoints: 15,
            supportPoints: 18,
            totalPoints: 103,
        },
        {
            name: "Owen Thompson",
            grade: 12,
            house: "Purple Reign",
            attendancePoints: 31,
            eventsPoints: 37,
            participationPoints: 27,
            servicePoints: 22,
            supportPoints: 25,
            totalPoints: 142,
        },
        {
            name: "Penelope Garcia",
            grade: 10,
            house: "Green Ivy",
            attendancePoints: 27,
            eventsPoints: 32,
            participationPoints: 22,
            servicePoints: 17,
            supportPoints: 20,
            totalPoints: 118,
        },
        {
            name: "Quinn Rodriguez",
            grade: 11,
            house: "Red Phoenix",
            attendancePoints: 32,
            eventsPoints: 37,
            participationPoints: 27,
            servicePoints: 22,
            supportPoints: 24,
            totalPoints: 142,
        },
        {
            name: "Riley Martinez",
            grade: 9,
            house: "Gold Hearts",
            attendancePoints: 22,
            eventsPoints: 30,
            participationPoints: 20,
            servicePoints: 14,
            supportPoints: 17,
            totalPoints: 103,
        },
        {
            name: "Samuel Robinson",
            grade: 12,
            house: "Blue Thunder",
            attendancePoints: 37,
            eventsPoints: 42,
            participationPoints: 32,
            servicePoints: 27,
            supportPoints: 30,
            totalPoints: 168,
        },
        {
            name: "Tara Clark",
            grade: 10,
            house: "Orange Supernova",
            attendancePoints: 30,
            eventsPoints: 34,
            participationPoints: 24,
            servicePoints: 20,
            supportPoints: 22,
            totalPoints: 130,
        },
        {
            name: "Ulysses Lewis",
            grade: 11,
            house: "Silver Knights",
            attendancePoints: 34,
            eventsPoints: 40,
            participationPoints: 30,
            servicePoints: 24,
            supportPoints: 27,
            totalPoints: 155,
        },
        {
            name: "Victoria Lee",
            grade: 9,
            house: "Pink Panthers",
            attendancePoints: 24,
            eventsPoints: 28,
            participationPoints: 21,
            servicePoints: 16,
            supportPoints: 19,
            totalPoints: 108,
        },
        {
            name: "Walter Walker",
            grade: 12,
            house: "Purple Reign",
            attendancePoints: 32,
            eventsPoints: 38,
            participationPoints: 28,
            servicePoints: 23,
            supportPoints: 26,
            totalPoints: 147,
        },
        {
            name: "Xena Young",
            grade: 10,
            house: "Green Ivy",
            attendancePoints: 28,
            eventsPoints: 33,
            participationPoints: 23,
            servicePoints: 18,
            supportPoints: 21,
            totalPoints: 123,
        },
        {
            name: "Yara Allen",
            grade: 11,
            house: "Red Phoenix",
            attendancePoints: 33,
            eventsPoints: 38,
            participationPoints: 28,
            servicePoints: 23,
            supportPoints: 25,
            totalPoints: 147,
        },
    ],
};

const LeaderboardStudents = () => {
    const sortedStudents = [...fakeStudentData.students].sort(
        (a, b) => b.totalPoints - a.totalPoints,
    );

    const sortedStudents9th = fakeStudentData.students
        .filter((student) => student.grade === 9)
        .sort((a, b) => b.totalPoints - a.totalPoints);
    const sortedStudents10th = fakeStudentData.students
        .filter((student) => student.grade === 10)
        .sort((a, b) => b.totalPoints - a.totalPoints);
    const sortedStudents11th = fakeStudentData.students
        .filter((student) => student.grade === 11)
        .sort((a, b) => b.totalPoints - a.totalPoints);
    const sortedStudents12th = fakeStudentData.students
        .filter((student) => student.grade === 12)
        .sort((a, b) => b.totalPoints - a.totalPoints);

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Student Leaderboard</h1>
            <table style={{ border: "4px solid black" }}>
                <thead style={{ border: "4px solid black" }}>
                    <tr>
                        <th>Rank</th>
                        <th>Students</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedStudents.map((student, index) => (
                        <tr
                            key={student.name}
                            style={{ border: "1px solid black" }}
                        >
                            <td>{index + 1}</td>{" "}
                            {/*giving the rank of starting at 0+1 */}
                            <td>{student.name}</td>
                            <td>{student.totalPoints}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Student Leaderboard</h1>
            <table style={{ border: "4px solid black" }}>
                <thead style={{ border: "4px solid black" }}>
                    <tr>
                        <th>Rank</th>
                        <th>Students</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedStudents9th.map((student, index) => (
                        <tr
                            key={student.name}
                            style={{ border: "1px solid black" }}
                        >
                            <td>{index + 1}</td>{" "}
                            {/*giving the rank of starting at 0+1 */}
                            <td>{student.name}</td>
                            <td>{student.totalPoints}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaderboardStudents;
