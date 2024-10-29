import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import app from './firebaseApp';

const db = getFirestore(app);




// Main Database Structure:

    // Houses (Collection)
    //   └── HouseId (Document)
    //   ├── HouseName: "House Alpha"
    //   ├── totalPoints: 80
    //   └── categoryPoints: 
    //       ├── caughtBeingGood: 50
    //       └── attendingSklEvents: 30
    //       └── participatingSklTeams: 20
    // └── members (Subcollection)
    //   └── memberId (Document)
    //       ├── memberName: "Alice"
    //       ├── totalPoints: 30
    //       └── categoryPoints:
    //           ├── caughtBeingGood: 20
    //           └── attendingSklEvents: 10
    //           └── participatingSklTeams: 20
    //   └── memberId2 (Document)
    //       ├── memberName: "Bob"
    //       ├── totalPoints: 50
    //       └── categoryPoints:
    //           ├── caughtBeingGood: 30
    //           └── attendingSklEvents: 20
    //           └── participatingSklTeams: 20

// Leaderboard Databases Structure (Auto-Compiled from the main database every 24 hours?):

    // Leaderboard (Collection)
    //   └── LeaderboardId (Document)
    //       ├── houseRankings (Array)
    //       │   ├── houseId (Object)
    //       │   │   ├── HouseName: "House Alpha"
    //       │   │   ├── totalPoints: 80
    //       │   │   └── rank: 1
    //       │   ├── houseId2 (Object)
    //       │   │   ├── HouseName: "House Beta"
    //       │   │   ├── totalPoints: 70
    //       │   │   └── rank: 2
    //       │   └── houseId3 (Object)
    //       │       ├── HouseName: "House Gamma"
    //       │       ├── totalPoints: 60
    //       │       └── rank: 3
    //       ├── memberRankings (Array)
    //       │   ├── memberId (Object)
    //       │   │   ├── memberName: "Alice"
    //       │   │   ├── totalPoints: 30
    //       │   │   └── rank: 1
    //       │   ├── memberId2 (Object)
    //       │   │   ├── memberName: "Bob"
    //       │   │   ├── totalPoints: 50
    //       │   │   └── rank: 2
    //       │   └── memberId3 (Object)
    //       │       ├── memberName: "Charlie"
    //       │       ├── totalPoints: 25
    //       │       └── rank: 3
    //       └── lastUpdated: <timestamp> // Indicates the last time the leaderboard was updated
