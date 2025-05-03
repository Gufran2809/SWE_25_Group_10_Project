import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqfEJfCk4IDL3Jd78euzRinZ_bs0iml0U",
  authDomain: "cricket-score-app-64a06.firebaseapp.com",
  projectId: "cricket-score-app-64a06",
  storageBucket: "cricket-score-app-64a06.firebasestorage.app",
  messagingSenderId: "368281391053",
  appId: "1:368281391053:web:2063d9a5f0496bdc37be84",
  measurementId: "G-KC1ZCTE27L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const playerNames = [
  'Rohit Sharma', 'Virat Kohli', 'KL Rahul', 'Shubman Gill', 'Shreyas Iyer',
  'Rishabh Pant', 'Hardik Pandya', 'Ravindra Jadeja', 'Mohammed Shami', 'Jasprit Bumrah',
  'Ajinkya Rahane', 'Cheteshwar Pujara', 'Suryakumar Yadav', 'Ishan Kishan', 'Axar Patel',
  'Yuzvendra Chahal', 'Kuldeep Yadav', 'Mohammed Siraj', 'Shardul Thakur', 'Washington Sundar',
  'Deepak Chahar', 'Bhuvneshwar Kumar', 'T Natarajan', 'Navdeep Saini', 'Prasidh Krishna',
  'Mayank Agarwal', 'Prithvi Shaw', 'Hanuma Vihari', 'Abhimanyu Easwaran', 'Ruturaj Gaikwad',
  'Devdutt Padikkal', 'Yashasvi Jaiswal', 'Karun Nair', 'Manish Pandey', 'Sanju Samson',
  'Nitish Rana', 'Rahul Tripathi', 'Venkatesh Iyer', 'Deepak Hooda', 'Krunal Pandya',
  'Ravi Bishnoi', 'Rahul Chahar', 'Varun Chakravarthy', 'Avesh Khan', 'Arshdeep Singh',
  'Umran Malik', 'Kartik Tyagi', 'Chetan Sakariya', 'Mukesh Kumar', 'Akash Deep',
  'Rinku Singh', 'Tilak Varma', 'Jitesh Sharma', 'Dhruv Jurel', 'Prabhsimran Singh',
  'Riyan Parag', 'Shivam Mavi', 'Ravi Teja', 'Mohit Sharma', 'Yash Dayal',
  'Tushar Deshpande', 'Matheesha Pathirana', 'Akash Singh', 'Raj Bawa', 'Kumar Kartikeya',
  'Shams Mulani', 'Tanush Kotian', 'Atit Sheth', 'Chintan Gaja', 'Yash Thakur',
  'Harshit Rana', 'Akash Madhwal', 'Vijaykumar Vyshak', 'Mayank Yadav', 'Rasikh Salam',
  'Abhishek Sharma', 'Shashank Singh', 'Priyam Garg', 'Rajat Patidar', 'Anuj Rawat',
  'Mahipal Lomror', 'Shubham Dubey', 'Vishnu Vinod', 'Anmolpreet Singh', 'Sarfaraz Khan',
  'Mandeep Singh', 'Himanshu Rana', 'Vivrant Sharma', 'Samarth Vyas', 'Shivalik Sharma',
  'Dhruv Shorey', 'Baba Indrajith', 'Nikin Jose', 'Rohan Kunnummal', 'Pukhraj Mann',
  'Akshay Wadkar', 'Urvil Patel', 'Aryan Juyal', 'Luvnith Sisodia', 'Arun Karthik',
  'Eknath Kerkar', 'Upendra Yadav', 'Kumar Kushagra', 'Prashant Solanki', 'Shiva Singh'
];

const teams = [
  'Engineering Titans', 'Science Strikers', 'Management Masters', 
  'Arts Avengers', 'Commerce Kings', 'Medical Mavericks',
  'Law Lords', 'Physics Panthers', 'Chemistry Champions', 'Mathematics Maestros'
];

const roles = ['batsman', 'bowler', 'all-rounder', 'wicketkeeper'];

const generateBattingStats = (skill = 'medium') => {
  const multiplier = skill === 'high' ? 1.3 : skill === 'low' ? 0.7 : 1;
  const runs = Math.floor(Math.random() * 500 + 300) * multiplier;
  const innings = Math.floor(Math.random() * 15 + 10);
  const notOuts = Math.floor(Math.random() * 5);
  const ballsFaced = Math.floor(Math.random() * 200 + 150);
  
  return {
    innings,
    runs: Math.floor(runs),
    notOuts,
    highest: Math.floor(Math.random() * 100 + 50),
    average: ((runs / (innings - notOuts)) || 0).toFixed(2),
    strikeRate: ((runs / ballsFaced) * 100).toFixed(2),
    fifties: Math.floor(Math.random() * 5),
    hundreds: Math.floor(Math.random() * 2),
    fours: Math.floor(Math.random() * 50 + 20),
    sixes: Math.floor(Math.random() * 20 + 5),
    lastFiveScores: Array(5).fill(0).map(() => Math.floor(Math.random() * 80 + 20)),
    ballsFaced,
    isOut: false
  };
};

const generateBowlingStats = (skill = 'medium') => {
  const multiplier = skill === 'high' ? 1.3 : skill === 'low' ? 0.7 : 1;
  const wickets = Math.floor(Math.random() * 25 + 15) * multiplier;
  const runs = Math.floor(Math.random() * 300 + 200);
  const overs = parseFloat((Math.random() * 50 + 30).toFixed(1));
  
  return {
    innings: Math.floor(Math.random() * 15 + 10),
    overs,
    wickets: Math.floor(wickets),
    runs,
    average: (runs / wickets).toFixed(2),
    economy: (runs / overs).toFixed(2),
    bestBowling: `${Math.floor(Math.random() * 5 + 2)}/${Math.floor(Math.random() * 20 + 10)}`,
    fiveWickets: Math.floor(Math.random() * 2)
  };
};

const generatePlayersArray = () => {
  return playerNames.map((name, index) => {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const matches = Math.floor(Math.random() * 20 + 15);
    
    const player = {
      id: `p${index + 1}`,
      name,
      team: teams[Math.floor(Math.random() * teams.length)],
      role,
      jerseyNumber: Math.floor(Math.random() * 99) + 1,
      profileImage: `/images/players/${name.toLowerCase().replace(' ', '')}.jpg`,
      isCaptain: Math.random() < 0.1, // 10% chance of being captain
      isWicketKeeper: Math.random() < 0.15, // 15% chance of being wicketkeeper
      stats: {
        overall: {
          matches
        }
      },
      achievements: []
    };

    // Current match stats (if playing)
    player.stats.ballsFaced = 0;
    player.stats.runs = 0;
    player.stats.isOut = false;
    player.stats.fours = 0;
    player.stats.sixes = 0;
    player.stats.strikeRate = "0.00";

    switch (role) {
      case 'batsman':
        player.stats.overall.batting = generateBattingStats('high');
        if (parseFloat(player.stats.overall.batting.average) > 40) {
          player.achievements.push('High Performance Batsman 2023');
        }
        if (player.stats.overall.batting.hundreds > 0) {
          player.achievements.push('Century Maker');
        }
        break;

      case 'bowler':
        player.stats.overall.bowling = generateBowlingStats('high');
        if (player.stats.overall.bowling.wickets > 25) {
          player.achievements.push('Most Wickets 2023');
        }
        if (player.stats.overall.bowling.fiveWickets > 0) {
          player.achievements.push('5 Wicket Haul Hero');
        }
        break;

      case 'all-rounder':
        player.stats.overall.batting = generateBattingStats('medium');
        player.stats.overall.bowling = generateBowlingStats('medium');
        if (parseFloat(player.stats.overall.batting.average) > 30 && 
            player.stats.overall.bowling.wickets > 20) {
          player.achievements.push('Best All-rounder 2023');
        }
        break;

      case 'wicketkeeper':
        player.stats.overall.batting = generateBattingStats('medium');
        player.stats.overall.keeping = {
          catches: Math.floor(Math.random() * 30 + 15),
          stumpings: Math.floor(Math.random() * 15 + 5)
        };
        player.stats.overall.keeping.totalDismissals = 
          player.stats.overall.keeping.catches + player.stats.overall.keeping.stumpings;
        if (player.stats.overall.keeping.totalDismissals > 30) {
          player.achievements.push('Best Wicketkeeper 2023');
        }
        break;
    }

    return player;
  });
};

export const samplePlayers = generatePlayersArray();

const uploadPlayers = async () => {
  try {
    const batch = writeBatch(db);
    
    samplePlayers.forEach((player) => {
      const playerRef = doc(db, 'players', player.id);
      batch.set(playerRef, player);
    });

    await batch.commit();
    console.log('Successfully uploaded 100 players to Firebase');
  } catch (error) {
    console.error('Error uploading players:', error);
  }
};

uploadPlayers();