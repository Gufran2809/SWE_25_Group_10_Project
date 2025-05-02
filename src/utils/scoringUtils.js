export const calculateBattingStats = (runs, balls) => {
  return {
    strikeRate: balls > 0 ? ((runs / balls) * 100).toFixed(2) : 0,
    average: 0 // Implement based on additional data needed
  };
};

export const calculateBowlingStats = (runs, overs, wickets) => {
  return {
    economy: overs > 0 ? (runs / overs).toFixed(2) : 0,
    average: wickets > 0 ? (runs / wickets).toFixed(2) : 0,
    strikeRate: wickets > 0 ? ((overs * 6) / wickets).toFixed(2) : 0
  };
};

export const generateCommentary = (ball) => {
  const { runs, isWicket, extra } = ball;
  if (isWicket) return "WICKET!";
  if (extra) return `${extra.toUpperCase()}!`;
  
  const commentary = {
    0: ["Dot ball", "No run", "Defended well"],
    1: ["Single taken", "Quick single", "Rotates strike"],
    2: ["Good running", "Two runs", "Double"],
    3: ["Three runs", "Good running between wickets", "Triple"],
    4: ["FOUR!", "Brilliant shot", "To the boundary"],
    6: ["SIX!", "Maximum!", "Over the ropes"]
  };

  return commentary[runs][Math.floor(Math.random() * commentary[runs].length)];
};

export const calculatePartnership = (balls) => {
  return balls.reduce((acc, ball) => ({
    runs: acc.runs + (ball.runs || 0),
    balls: acc.balls + 1
  }), { runs: 0, balls: 0 });
};
