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
import { db, isFirebaseConfigured } from './firebase';
import { dispatchAdminNotification } from './emailService';

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
    console.debug('Failed to parse local submissions:', err);
    return [];
  }
};

// Helper to save local stored submissions
const saveLocalSubmissions = (items: ContactSubmission[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
    window.dispatchEvent(new CustomEvent(SUBMISSION_EVENT, { detail: items }));
  } catch (err) {
    console.debug('Failed to write to localStorage:', err);
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
  
  // 2. Dispatch automated external email & telegram forwarding in background
  dispatchAdminNotification(data).catch(err => {
    console.debug('Notification forwarding status:', err);
  });

  // 3. Also attempt to save to Firestore database if configured
  if (db && isFirebaseConfigured) {
    try {
      const firestoreData = {
        ...newRecord,
        firestoreCreatedAt: serverTimestamp()
      };
      addDoc(collection(db, 'contact_submissions'), firestoreData).catch(fsErr => {
        console.debug('Firestore write notice (local fallback active):', fsErr?.message || fsErr);
      });
    } catch (err) {
      console.debug('Firestore save skipped:', err);
    }
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

  // Try Firestore update if active
  if (db && isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'contact_submissions', id), {
        status: newStatus
      });
    } catch (err) {
      console.debug('Firestore doc update skipped:', err);
    }
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

  // Try Firestore delete if active
  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'contact_submissions', id));
    } catch (err) {
      console.debug('Firestore doc delete skipped:', err);
    }
  }
};

/**
 * Real-time combined subscriber (LocalStorage + Custom Events + Firestore if active)
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

  // 3. Listen to Firestore realtime stream if configured
  let unsubscribeFirestore = () => {};
  if (db && isFirebaseConfigured) {
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
        console.debug('Firestore realtime stream fallback to local mode:', err?.message || err);
        onUpdate(getLocalSubmissions());
      });
    } catch (err) {
      console.debug('Firestore onSnapshot init skipped:', err);
    }
  }

  return () => {
    window.removeEventListener(SUBMISSION_EVENT, handleLocalCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    unsubscribeFirestore();
  };
};
