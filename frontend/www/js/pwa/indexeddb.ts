const DB_NAME = 'omegaup-pwa';
const DB_VERSION = 1;
const STORE_NAME = 'submissions';

export interface SubmissionData {
  id: string;
  code: string;
  status: 'pending' | 'submitted';
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(event.target);
    request.onsuccess = (event: any) => resolve(event.target.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveSubmission(submission: SubmissionData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(submission);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target);
  });
}
