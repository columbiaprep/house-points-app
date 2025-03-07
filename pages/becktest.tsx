import React, { useState, useEffect } from 'react';
import '../styles/globals.css'; // Global styles for overall app look
import '../styles/leaderboard.css'; // Specific styles for the leaderboard component

interface LeaderboardItem {
  name: string; // House's Score
  points: number; // House's score
}


interface LeaderboardProps { // Had some help from https://www.w3schools.com/react/react_props.asp for everything below this line 
  title?: string; // Leaderboard Title -> Defualts to Leaderboard
  leaderboardData: LeaderboardItem[]; // Data to display in leaderboard on webpage
  loadingTime?: number; // Loading Time -> Defualts to 3000ms
}

const Leaderboard: React.FC<LeaderboardProps> = ({ //React Functional Component For Leaderboard Props
  title = 'Leaderboard',
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
                className={`leaderboard-item ${hoveredIndex === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)} // Change hover state when mouse enters item -> This part is still a WIP
                onMouseLeave={() => setHoveredIndex(null)} // Reset hover state when mouse leaves item -> This part is still a WIP
              >
                <div className="rank">{index + 1}</div>
                <div className="name">{item.name}</div>
                <div className="points">{item.points} Points</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TestPage: React.FC = () => { //React Functional Component For Individual Houses
  const leaderboardData = [
    { name: 'Blue Thunder', points: 1200 },
    { name: 'Orange Supernova', points: 1100 },
    { name: 'Purple Reign', points: 1050 },
    { name: 'Green Ivy', points: 950 },
    { name: 'Golden Hearts', points: 900 },
    { name: 'Red Phoenix', points: 850 },
    { name: 'Silver Knights', points: 800 },
    { name: 'Pink Panthers', points: 750 },
  ];

  return (
    <Leaderboard
      title="Leaderboard"
      leaderboardData={leaderboardData}
      loadingTime={2000} // Sets loading time for 2 seconds
    />
  );
};

export default TestPage; // Export TestPage so it can be used elsewhere in the app if needed 
