import React, { useState, useEffect } from 'react';
import '../styles/globals.css'; // Import global styles for background
import '../styles/leaderboard.css'; // Import leaderboard-specific styles

interface LeaderboardItem {
  name: string;
  points: number;
}

const leaderboardData: LeaderboardItem[] = [
  { name: 'Blue Thunder', points: 1200 }, // Blue
  { name: 'Orange Supernova', points: 1100 }, // Orange
  { name: 'Purple Reign', points: 1050 }, // Purple
  { name: 'Green Ivy', points: 950 }, // Green
  { name: 'Golden Hearts', points: 900 }, // Gold
  { name: 'Red Phoenix', points: 850 }, // Red
  { name: 'Silver Knights', points: 800 }, // Silver
  { name: 'Pink Panthers', points: 750 }, // Pink
];

const Leaderboard: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsLoading(false); // Stop loading after 3 seconds
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
