import { db } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export interface HistoryEntry {
  id: string;
  date: string;
  riskLevel: string;
  riskLabel: string;
  totalFlags: number;
  result: any; // Full AnalysisResult
  userId?: string;
  createdAt?: any;
}

/**
 * Saves a contract analysis entry to Firestore.
 */
export async function saveContractAnalysis(userId: string, entry: Omit<HistoryEntry, 'userId'>) {
  const docRef = doc(db, 'contracts', entry.id);
  await setDoc(docRef, {
    ...entry,
    userId,
    createdAt: serverTimestamp() // Database-side timestamp
  });
}

/**
 * Fetches all contract analyses for a specific user, sorted by date in memory
 * to avoid requiring composite Firestore indexes.
 */
export async function getUserAnalyses(userId: string): Promise<HistoryEntry[]> {
  try {
    const q = query(
      collection(db, 'contracts'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const entries: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        date: data.date,
        riskLevel: data.riskLevel,
        riskLabel: data.riskLabel,
        totalFlags: data.totalFlags,
        result: data.result,
        // Convert Firestore timestamp or fallback to date string parse
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(data.date)
      });
    });
    
    // Sort in memory descending (newest first)
    return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching user analyses from Firestore:', error);
    throw error;
  }
}

/**
 * Deletes a contract analysis entry from Firestore.
 */
export async function deleteUserAnalysis(analysisId: string) {
  try {
    const docRef = doc(db, 'contracts', analysisId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting analysis from Firestore:', error);
    throw error;
  }
}
