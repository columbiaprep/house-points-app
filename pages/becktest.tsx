import React, { useState, useEffect } from 'react';
import '../styles/globals.css'; // Import global styles for background and overall look of leaderboard
import '../styles/leaderboard.css'; // Import leaderboard-specific styles

interface LeaderboardItem {
  name: string;
  points: number;
}

const leaderboardData: LeaderboardItem[] = [
  { name: 'Blue Thunder', points: 1200 }, // Blue House
  { name: 'Orange Supernova', points: 1100 }, // Orange House
  { name: 'Purple Reign', points: 1050 }, // Purple House
  { name: 'Green Ivy', points: 950 }, // Green House
  { name: 'Golden Hearts', points: 900 }, // Gold House
  { name: 'Red Phoenix', points: 850 }, // Red House
  { name: 'Silver Knights', points: 800 }, // Silver House
  { name: 'Pink Panthers', points: 750 }, // Pink House
];

const Leaderboard: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 3 seconds for asthetic looks and overall smoothness 
    setTimeout(() => {
      setIsLoading(false); // Stops loading after 3 seconds 
    }, 3000);
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="tablet">
        <h1 className="tablet-title">Leaderboard</h1>
        <div className="leaderboard-list">
          {isLoading ? (
            <div className="loading">Loading...</div> // Show loading text during loading 
          ) : (
            leaderboardData.map((item, index) => (
              <div
                key={index}
                className={`leaderboard-item ${hoveredIndex === index ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
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

export default Leaderboard;
