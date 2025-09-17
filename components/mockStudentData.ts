// Mock student data generator for admin testing

export interface MockStudentData {
    id: string;
    name: string;
    grade: number;
    house: string;
    totalPoints: number;
    houseRank?: number;
    [key: string]: any; // Dynamic point categories
}

// Generate realistic mock student data for testing
export function generateMockStudentData(houseColor: string): MockStudentData {
    const mockCategories = [
        {
            key: "caughtBeingGood",
            name: "Caught Being Good",
            points: Math.floor(Math.random() * 50) + 10,
        },
        {
            key: "attendance",
            name: "Attendance",
            points: Math.floor(Math.random() * 30) + 15,
        },
        {
            key: "participation",
            name: "Participation",
            points: Math.floor(Math.random() * 40) + 5,
        },
        {
            key: "communityService",
            name: "Community Service",
            points: Math.floor(Math.random() * 25) + 5,
        },
        {
            key: "events",
            name: "Events",
            points: Math.floor(Math.random() * 35) + 10,
        },
        {
            key: "support",
            name: "Support",
            points: Math.floor(Math.random() * 20) + 5,
        },
    ];

    const mockStudent: MockStudentData = {
        id: "test-admin@cgps.org",
        name: "Test Student (Admin View)",
        grade: 11,
        house: houseColor,
        totalPoints: 0,
        houseRank: 3,
    };

    // Add category points
    mockCategories.forEach((category) => {
        mockStudent[category.key] = category.points;
    });

    // Calculate total
    mockStudent.totalPoints = mockCategories.reduce(
        (total, cat) => total + cat.points,
        0,
    );

    return mockStudent;
}

// Generate mock chart data that matches the real structure
export function generateMockPersonalChartData(houseColor: string) {
    const mockStudent = generateMockStudentData(houseColor);
    const categories = [
        { key: "caughtBeingGood", name: "Caught Being Good" },
        { key: "attendance", name: "Attendance" },
        { key: "participation", name: "Participation" },
        { key: "communityService", name: "Community Service" },
        { key: "events", name: "Events" },
        { key: "support", name: "Support" },
    ];

    const labels: string[] = [];
    const data: number[] = [];

    categories.forEach((category) => {
        if (mockStudent[category.key] && mockStudent[category.key] > 0) {
            labels.push(`${category.name}: ${mockStudent[category.key]} pts`);
            data.push(mockStudent[category.key]);
        }
    });

    // Import the color generation functions
    const generateHouseColors = (
        colorName: string,
        count: number = 5,
        baseOpacity: number = 0.8,
    ): string[] => {
        const colorMap: { [key: string]: { r: number; g: number; b: number } } =
            {
                blue: { r: 59, g: 130, b: 246 },
                green: { r: 34, g: 197, b: 94 },
                red: { r: 239, g: 68, b: 68 },
                yellow: { r: 234, g: 179, b: 8 },
                purple: { r: 168, g: 85, b: 247 },
                pink: { r: 236, g: 72, b: 153 },
                orange: { r: 249, g: 115, b: 22 },
                gray: { r: 107, g: 114, b: 128 },
                silver: { r: 156, g: 163, b: 175 },
                gold: { r: 245, g: 158, b: 11 },
                cyan: { r: 6, g: 182, b: 212 },
            };

        const baseColor = colorMap[colorName.toLowerCase()] || colorMap.blue;
        const colors: string[] = [];

        for (let i = 0; i < count; i++) {
            const opacity = baseOpacity - i * 0.15;
            const finalOpacity = Math.max(opacity, 0.3);

            colors.push(
                `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${finalOpacity})`,
            );
        }

        return colors;
    };

    const generateBorderColors = (
        colorName: string,
        count: number = 5,
    ): string[] => {
        const colorMap: { [key: string]: { r: number; g: number; b: number } } =
            {
                blue: { r: 59, g: 130, b: 246 },
                green: { r: 34, g: 197, b: 94 },
                red: { r: 239, g: 68, b: 68 },
                yellow: { r: 234, g: 179, b: 8 },
                purple: { r: 168, g: 85, b: 247 },
                pink: { r: 236, g: 72, b: 153 },
                orange: { r: 249, g: 115, b: 22 },
                gray: { r: 107, g: 114, b: 128 },
                silver: { r: 156, g: 163, b: 175 },
                gold: { r: 245, g: 158, b: 11 },
                cyan: { r: 6, g: 182, b: 212 },
            };

        const baseColor = colorMap[colorName.toLowerCase()] || colorMap.blue;
        const colors: string[] = [];

        for (let i = 0; i < count; i++) {
            colors.push(
                `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 1)`,
            );
        }

        return colors;
    };

    const backgroundColors = generateHouseColors(
        houseColor,
        labels.length,
        0.7,
    );
    const borderColors = generateBorderColors(houseColor, labels.length);

    return {
        labels,
        datasets: [
            {
                label: "Personal Points (Test Data)",
                data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: "bottom" as const,
                    labels: {
                        boxWidth: 15,
                        padding: 10,
                        usePointStyle: true,
                        generateLabels: function (chart: any) {
                            const data = chart.data;

                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(
                                    (label: string, index: number) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[index];

                                        return {
                                            text: `${label.split(":")[0]}: ${value} pts`,
                                            fillStyle:
                                                dataset.backgroundColor[index],
                                            strokeStyle:
                                                dataset.borderColor[index],
                                            lineWidth: dataset.borderWidth,
                                            hidden: false,
                                            index: index,
                                        };
                                    },
                                );
                            }

                            return [];
                        },
                    },
                },
            },
            layout: {
                padding: {
                    bottom: 20,
                },
            },
        },
    };
}

// Generate mock nearby rankings data for testing
export function generateMockNearbyRankings(
    houseInput: string,
    testPoints: number = 150,
): MockStudentData[] {
    // Handle both house colors and house names
    const houseNameMap: { [key: string]: string } = {
        blue: "Blue House",
        gold: "Gold House",
        green: "Green House",
        orange: "Orange House",
        pink: "Pink House",
        purple: "Purple House",
        red: "Red House",
        silver: "Silver House",
    };

    // Check if input is already a house name or needs conversion
    let houseName: string;

    if (houseInput.includes("House")) {
        houseName = houseInput; // Already a house name like "Red House"
    } else {
        houseName = houseNameMap[houseInput.toLowerCase()] || "Blue House"; // Convert color to house name
    }

    // Generate 5 students (2 above, current, 2 below)
    const mockStudents: MockStudentData[] = [];

    // Student names for variety
    const studentNames = [
        "Alice Johnson",
        "Bob Smith",
        "Charlie Brown",
        "Diana Prince",
        "Ethan Hunt",
        "Fiona Apple",
        "George Lucas",
        "Hannah Montana",
        "Ian Fleming",
        "Julia Roberts",
    ];

    // Create current test student (rank 3)
    const currentStudent: MockStudentData = {
        id: "test-admin@cgps.org",
        name: "Test Student (You)",
        grade: 11,
        house: houseName,
        totalPoints: testPoints,
        houseRank: 3,
    };

    // Add point categories to current student
    const mockCategories = [
        { key: "caughtBeingGood", points: Math.floor(testPoints * 0.3) },
        { key: "attendance", points: Math.floor(testPoints * 0.2) },
        { key: "participation", points: Math.floor(testPoints * 0.25) },
        { key: "communityService", points: Math.floor(testPoints * 0.1) },
        { key: "events", points: Math.floor(testPoints * 0.1) },
        { key: "support", points: Math.floor(testPoints * 0.05) },
    ];

    mockCategories.forEach((category) => {
        currentStudent[category.key] = category.points;
    });

    // Generate students above (ranks 1-2)
    for (let i = 1; i <= 2; i++) {
        const pointVariation = Math.floor(Math.random() * 50) + 30; // 30-80 points above
        const student: MockStudentData = {
            id: `mock-student-${i}@cgps.org`,
            name: studentNames[i - 1],
            grade: Math.floor(Math.random() * 4) + 9, // Grades 9-12
            house: houseName,
            totalPoints: testPoints + pointVariation,
            houseRank: i,
        };

        // Add random point categories
        mockCategories.forEach((category) => {
            const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10 variation

            student[category.key] = Math.max(0, category.points + variation);
        });

        mockStudents.push(student);
    }

    // Add current student
    mockStudents.push(currentStudent);

    // Generate students below (ranks 4-5)
    for (let i = 4; i <= 5; i++) {
        const pointVariation = Math.floor(Math.random() * 40) + 10; // 10-50 points below
        const student: MockStudentData = {
            id: `mock-student-${i}@cgps.org`,
            name: studentNames[i + 1],
            grade: Math.floor(Math.random() * 4) + 9, // Grades 9-12
            house: houseName,
            totalPoints: testPoints - pointVariation,
            houseRank: i,
        };

        // Add random point categories
        mockCategories.forEach((category) => {
            const variation = Math.floor(Math.random() * 15) - 5; // -5 to +10 variation

            student[category.key] = Math.max(
                0,
                Math.floor(category.points * 0.8) + variation,
            );
        });

        mockStudents.push(student);
    }

    return mockStudents;
}
