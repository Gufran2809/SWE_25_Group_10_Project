import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { samplePlayers } from '../data/samplePlayers';

export const initializePlayers = async () => {
  try {
    const batch = writeBatch(db);
    
    for (const player of samplePlayers) {
      const playerRef = doc(db, 'players', player.id);
      batch.set(playerRef, player);
    }

    await batch.commit();
    console.log('Successfully initialized 10 players');
  } catch (error) {
    console.error('Error initializing players:', error);
  }
};