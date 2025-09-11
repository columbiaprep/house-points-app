const fakeHouseData = {
    houses: [
        {
            name: "Green Ivy",
            attendancePoints: 150,
            eventsPoints: 220,
            participationPoints: 180,
            servicePoints: 100,
            supportPoints: 130,
            totalPoints: 780,
        },
        {
            name: "Red Phoenix",
            attendancePoints: 180,
            eventsPoints: 250,
            participationPoints: 200,
            servicePoints: 120,
            supportPoints: 150,
            totalPoints: 900,
        },
        {
            name: "Gold Hearts",
            attendancePoints: 120,
            eventsPoints: 200,
            participationPoints: 160,
            servicePoints: 90,
            supportPoints: 110,
            totalPoints: 680,
        },
        {
            name: "Blue Thunder",
            attendancePoints: 200,
            eventsPoints: 280,
            participationPoints: 220,
            servicePoints: 140,
            supportPoints: 170,
            totalPoints: 1010,
        },
        {
            name: "Orange Supernova",
            attendancePoints: 160,
            eventsPoints: 230,
            participationPoints: 190,
            servicePoints: 110,
            supportPoints: 140,
            totalPoints: 830,
        },
        {
            name: "Silver Knights",
            attendancePoints: 190,
            eventsPoints: 260,
            participationPoints: 210,
            servicePoints: 130,
            supportPoints: 160,
            totalPoints: 950,
        },
        {
            name: "Pink Panthers",
            attendancePoints: 130,
            eventsPoints: 210,
            participationPoints: 170,
            servicePoints: 105,
            supportPoints: 120,
            totalPoints: 735,
        },
        {
            name: "Purple Reign",
            attendancePoints: 170,
            eventsPoints: 240,
            participationPoints: 205,
            servicePoints: 125,
            supportPoints: 155,
            totalPoints: 895,
        },
    ],
};

const HouseLeaderboard = () => {
    const sortedHouses = [...fakeHouseData.houses].sort(
        (a, b) => b.totalPoints - a.totalPoints,
    ); //this is changing the order of the houses from greatest to least by checking if the next house is greater or less than the past one

    return (
        <div
            style={{
                border: "1px solid black",
                padding: "2rem",
                fontFamily: "sans-serif",
            }}
        >
            <h2>House Leaderboard</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>House</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedHouses.map((house, index) => (
                        <tr key={house.name}>
                            <td>{index + 1}</td>
                            <td>{house.name}</td>
                            <td>{house.totalPoints}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HouseLeaderboard;
