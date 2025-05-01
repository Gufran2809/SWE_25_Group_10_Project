export const samplePlayers = [
  {
    id: 'p1',
    name: 'Rohit Sharma',
    team: 'Engineering Titans',
    role: 'batsman',
    jerseyNumber: 7,
    profileImage: '/images/players/rohit.jpg',
    stats: {
      overall: {
        matches: 24,
        batting: {
          innings: 24,
          runs: 892,
          notOuts: 4,
          highest: 145,
          average: 44.60,
          strikeRate: 152.3,
          fifties: 6,
          hundreds: 2,
          fours: 78,
          sixes: 42,
          lastFiveScores: [85, 45, 67, 32, 89]
        }
      }
    },
    achievements: ['Fastest 150 in University Cricket', 'Best Batsman 2023']
  },
  {
    id: 'p2',
    name: 'Anil Kumar',
    team: 'Science Strikers',
    role: 'bowler',
    jerseyNumber: 11,
    profileImage: '/images/players/anil.jpg',
    stats: {
      overall: {
        matches: 22,
        bowling: {
          innings: 22,
          overs: 82.4,
          wickets: 34,
          runs: 412,
          average: 12.11,
          economy: 5.02,
          bestBowling: '6/23',
          fiveWickets: 2,
          lastFiveSpells: [
            { wickets: 3, runs: 24 },
            { wickets: 2, runs: 18 },
            { wickets: 4, runs: 22 },
            { wickets: 1, runs: 19 },
            { wickets: 3, runs: 25 }
          ]
        }
      }
    },
    achievements: ['Best Bowler 2023', 'Hat-trick Hero']
  },
  {
    id: 'p3',
    name: 'Rahul Dev',
    team: 'Management Masters',
    role: 'all-rounder',
    jerseyNumber: 23,
    profileImage: '/images/players/rahul.jpg',
    stats: {
      overall: {
        matches: 20,
        batting: {
          innings: 18,
          runs: 456,
          notOuts: 3,
          highest: 82,
          average: 30.40,
          strikeRate: 128.5,
          fifties: 3,
          hundreds: 0,
          lastFiveScores: [45, 23, 82, 34, 56]
        },
        bowling: {
          innings: 20,
          overs: 76.0,
          wickets: 28,
          runs: 378,
          average: 13.50,
          economy: 4.97,
          bestBowling: '4/22'
        }
      }
    },
    achievements: ['Best All-rounder 2023']
  },
  {
    id: 'p4',
    name: 'Vikas Singh',
    team: 'Arts Avengers',
    role: 'batsman',
    jerseyNumber: 45,
    profileImage: '/images/players/vikas.jpg',
    stats: {
      overall: {
        matches: 18,
        batting: {
          innings: 18,
          runs: 634,
          notOuts: 2,
          highest: 96,
          average: 39.62,
          strikeRate: 142.8,
          fifties: 5,
          hundreds: 0,
          lastFiveScores: [96, 45, 23, 67, 42]
        }
      }
    },
    achievements: ['Most Boundaries 2023']
  },
  {
    id: 'p5',
    name: 'Mohammed Ali',
    team: 'Commerce Kings',
    role: 'bowler',
    jerseyNumber: 99,
    profileImage: '/images/players/ali.jpg',
    stats: {
      overall: {
        matches: 21,
        bowling: {
          innings: 21,
          overs: 79.3,
          wickets: 32,
          runs: 398,
          average: 12.43,
          economy: 5.01,
          bestBowling: '5/28',
          fiveWickets: 1
        }
      }
    },
    achievements: ['Most Wickets 2023']
  },
  {
    id: 'p6',
    name: 'Sunil Patel',
    team: 'Engineering Titans',
    role: 'wicketkeeper',
    jerseyNumber: 17,
    profileImage: '/images/players/sunil.jpg',
    stats: {
      overall: {
        matches: 24,
        batting: {
          innings: 20,
          runs: 478,
          notOuts: 4,
          highest: 75,
          average: 29.87,
          strikeRate: 134.2,
          fifties: 3,
          hundreds: 0
        },
        keeping: {
          catches: 28,
          stumpings: 12,
          totalDismissals: 40
        }
      }
    },
    achievements: ['Best Wicketkeeper 2023']
  },
  {
    id: 'p7',
    name: 'Rajesh Kumar',
    team: 'Science Strikers',
    role: 'all-rounder',
    jerseyNumber: 33,
    profileImage: '/images/players/rajesh.jpg',
    stats: {
      overall: {
        matches: 19,
        batting: {
          innings: 17,
          runs: 389,
          notOuts: 3,
          highest: 72,
          average: 27.78,
          strikeRate: 122.4,
          fifties: 2
        },
        bowling: {
          innings: 19,
          overs: 68.2,
          wickets: 24,
          runs: 342,
          average: 14.25,
          economy: 5.01,
          bestBowling: '4/29'
        }
      }
    },
    achievements: ['Match Winner Award 2023']
  },
  {
    id: 'p8',
    name: 'Sanjay Verma',
    team: 'Management Masters',
    role: 'bowler',
    jerseyNumber: 88,
    profileImage: '/images/players/sanjay.jpg',
    stats: {
      overall: {
        matches: 20,
        bowling: {
          innings: 20,
          overs: 75.1,
          wickets: 29,
          runs: 367,
          average: 12.65,
          economy: 4.89,
          bestBowling: '5/31',
          fiveWickets: 1
        }
      }
    },
    achievements: ['Best Economy Rate 2023']
  },
  {
    id: 'p9',
    name: 'Ajay Rathod',
    team: 'Arts Avengers',
    role: 'batsman',
    jerseyNumber: 77,
    profileImage: '/images/players/ajay.jpg',
    stats: {
      overall: {
        matches: 22,
        batting: {
          innings: 22,
          runs: 756,
          notOuts: 3,
          highest: 112,
          average: 39.78,
          strikeRate: 138.6,
          fifties: 4,
          hundreds: 1,
          lastFiveScores: [112, 45, 67, 23, 89]
        }
      }
    },
    achievements: ['Most Consistent Batsman 2023']
  },
  {
    id: 'p10',
    name: 'Kiran Shah',
    team: 'Commerce Kings',
    role: 'all-rounder',
    jerseyNumber: 55,
    profileImage: '/images/players/kiran.jpg',
    stats: {
      overall: {
        matches: 23,
        batting: {
          innings: 20,
          runs: 445,
          notOuts: 4,
          highest: 86,
          average: 27.81,
          strikeRate: 129.7,
          fifties: 2
        },
        bowling: {
          innings: 23,
          overs: 82.4,
          wickets: 27,
          runs: 412,
          average: 15.25,
          economy: 4.99,
          bestBowling: '4/25'
        }
      }
    },
    achievements: ['Most Valuable Player 2023']
  }
];