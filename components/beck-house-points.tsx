const Leaderboard: React.FC<LeaderboardProps> = ({
    //React Functional Component For Leaderboard Props
    title = "Leaderboard",
    leaderboardData,
    loadingTime = 3000,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // Track which item is being hovered over by mouse
    const [isLoading, setIsLoading] = useState(true); // Control loading state

    useEffect(() => {
        // Simulating loading by using a timeout. This is to add some effect and lets everything load properly
        setTimeout(() => {
            setIsLoading(false); // Data has finished loading after `loadingTime`
        }, loadingTime);
    }, [loadingTime]);

    return (
        <div className="leaderboard-container">
            <div className="tablet">
                <h1 className="tablet-title">{title}</h1>
                <div className="leaderboard-list">
                    {isLoading ? (
                        <div className="loading">Loading...</div> // Display "Loading..." while waiting for data and for the website to initialize
                    ) : (
                        leaderboardData.map((item, index) => (
                            <div
                                key={index}
                                className={`leaderboard-item ${hoveredIndex === index ? "hovered" : ""}`} // Checks whether two values are equal both in value and type
                                onMouseEnter={() => setHoveredIndex(index)} // Change hover state when mouse enters item -> This part is still a WIP
                                onMouseLeave={() => setHoveredIndex(null)} // Reset hover state when mouse leaves item -> This part is still a WIP
                            >
                                <div className="rank">{index + 1}</div>
                                <div className="name">{item.name}</div>
                                <div className="points">
                                    {item.points} Points
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
