import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  services?: string[];
  budget?: string;
  message: string;
  status: 'new' | 'in-review' | 'contacted' | 'closed';
  source?: string;
  type?: 'inquiry' | 'career' | 'vendor' | 'newsletter';
  positionTitle?: string;
  portfolioUrl?: string;
  specialty?: string;
  rateCard?: string;
  experienceYears?: string;
  tools?: string;
  createdAt: string;
  userAgent?: string;
}

const STORAGE_KEY = 'kapitech_contact_submissions';
const SUBMISSION_EVENT = 'kapitech_submission_updated';

// Helper to get local stored submissions
export const getLocalSubmissions = (): ContactSubmission[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to parse local submissions:', err);
    return [];
  }
};

// Helper to save local stored submissions
const saveLocalSubmissions = (items: ContactSubmission[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
    window.dispatchEvent(new CustomEvent(SUBMISSION_EVENT, { detail: items }));
  } catch (err) {
    console.warn('Failed to write to localStorage:', err);
  }
};

/**
 * Universal submission handler for all website forms:
 * - /contact form
 * - /careers application form
 * - /careers freelance vendor form
 * - footer newsletter
 */
export const submitToInbox = async (data: Omit<ContactSubmission, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; id: string }> => {
  const generatedId = 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const nowIso = new Date().toISOString();

  const newRecord: ContactSubmission = {
    id: generatedId,
    status: 'new',
    createdAt: nowIso,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    ...data
  };

  // 1. Immediately persist to LocalStorage & dispatch instant UI update
  const existing = getLocalSubmissions();
  const updatedList = [newRecord, ...existing.filter(i => i.id !== generatedId)];
  saveLocalSubmissions(updatedList);

  // 2. Also attempt to save to Firestore database if online
  try {
    const firestoreData = {
      ...newRecord,
      firestoreCreatedAt: serverTimestamp()
    };
    // Non-blocking firestore attempt
    addDoc(collection(db, 'contact_submissions'), firestoreData).then(docRef => {
      // If Firestore creates a real doc, we can store docRef.id
      console.log('Successfully saved to Firestore doc:', docRef.id);
    }).catch(fsErr => {
      console.warn('Firestore write warning (local fallback used):', fsErr?.message || fsErr);
    });
  } catch (err) {
    console.warn('Firestore connection notice (stored in local database):', err);
  }

  return { success: true, id: generatedId };
};

/**
 * Update submission status in both LocalStorage & Firestore
 */
export const updateSubmissionStatus = async (id: string, newStatus: ContactSubmission['status']): Promise<void> => {
  // Update local
  const current = getLocalSubmissions();
  const updated = current.map(item => item.id === id ? { ...item, status: newStatus } : item);
  saveLocalSubmissions(updated);

  // Try Firestore update
  try {
    await updateDoc(doc(db, 'contact_submissions', id), {
      status: newStatus
    });
  } catch (err) {
    // Firestore doc ID might differ from local generated ID if created offline, safe to ignore
    console.log('Firestore doc update skipped or offline:', err);
  }
};

/**
 * Delete submission from both LocalStorage & Firestore
 */
export const deleteSubmission = async (id: string): Promise<void> => {
  // Delete local
  const current = getLocalSubmissions();
  const filtered = current.filter(item => item.id !== id);
  saveLocalSubmissions(filtered);

  // Try Firestore delete
  try {
    await deleteDoc(doc(db, 'contact_submissions', id));
  } catch (err) {
    console.log('Firestore doc delete skipped or offline:', err);
  }
};

/**
 * Real-time combined subscriber (Firestore + LocalStorage + Custom Events)
 */
export const subscribeToInbox = (onUpdate: (submissions: ContactSubmission[]) => void): (() => void) => {
  // Initial local state delivery
  const initialLocal = getLocalSubmissions();
  onUpdate(initialLocal);

  let localCache = [...initialLocal];

  // Helper to merge Firestore snapshots with LocalStorage
  const mergeAndNotify = (firestoreList: ContactSubmission[]) => {
    const mergedMap = new Map<string, ContactSubmission>();

    // Put all local cache first
    localCache.forEach(item => mergedMap.set(item.id, item));

    // Override or add from Firestore
    firestoreList.forEach(item => {
      // Find if matched by ID or identical fields
      mergedMap.set(item.id, item);
    });

    const combined = Array.from(mergedMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    onUpdate(combined);
  };

  // 1. Listen to Local Custom Events (same-tab immediate update)
  const handleLocalCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<ContactSubmission[]>;
    if (customEvent.detail && Array.isArray(customEvent.detail)) {
      localCache = customEvent.detail;
      onUpdate(localCache);
    } else {
      localCache = getLocalSubmissions();
      onUpdate(localCache);
    }
  };
  window.addEventListener(SUBMISSION_EVENT, handleLocalCustomEvent);

  // 2. Listen to browser Storage event (cross-tab sync)
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      localCache = getLocalSubmissions();
      onUpdate(localCache);
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  // 3. Listen to Firestore realtime stream
  let unsubscribeFirestore = () => {};
  try {
    const q = query(collection(db, 'contact_submissions'), orderBy('createdAt', 'desc'));
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const fsItems: ContactSubmission[] = [];
      snapshot.forEach((docSnap) => {
        fsItems.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ContactSubmission);
      });
      mergeAndNotify(fsItems);
    }, (err) => {
      console.warn('Firestore realtime stream fallback to local mode:', err?.message || err);
      onUpdate(getLocalSubmissions());
    });
  } catch (err) {
    console.warn('Firestore onSnapshot init notice:', err);
  }

  return () => {
    window.removeEventListener(SUBMISSION_EVENT, handleLocalCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    unsubscribeFirestore();
  };
};
