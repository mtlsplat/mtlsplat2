import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { SplatItem } from './types/splat';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore as mandated by integration guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connecting: please check network/configuration.');
    }
  }
}
testConnection();

const SPLATS_PATH = 'splats';

/**
 * Real-time listener for community splats stored in Firestore
 */
export function subscribeToRemoteSplats(
  onUpdate: (splats: SplatItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, SPLATS_PATH));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: SplatItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.supersplatId && data.title && data.url) {
          items.push({
            id: docSnap.id,
            supersplatId: String(data.supersplatId),
            title: String(data.title),
            description: String(data.description || ''),
            url: String(data.url),
            posterUrl: data.posterUrl ? String(data.posterUrl) : undefined,
            category: String(data.category || 'Communauté'),
            splatCount: data.splatCount ? String(data.splatCount) : undefined,
            captureNotes: data.captureNotes ? String(data.captureNotes) : undefined,
            createdAt: String(data.createdAt || new Date().toISOString().split('T')[0]),
            isUserOriginal: Boolean(data.isUserOriginal),
          });
        }
      });
      onUpdate(items);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, SPLATS_PATH);
      } catch (e) {
        if (onError && e instanceof Error) {
          onError(e);
        }
      }
    }
  );

  return unsubscribe;
}

/**
 * Persist a newly contributed splat into Firestore
 */
export async function saveSplatToFirestore(splat: SplatItem): Promise<void> {
  const sanitizedId = splat.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const docRef = doc(db, SPLATS_PATH, sanitizedId);

  const payload: Record<string, any> = {
    id: sanitizedId,
    supersplatId: splat.supersplatId.slice(0, 64),
    title: splat.title.slice(0, 100),
    description: (splat.description || '').slice(0, 1000),
    url: splat.url.slice(0, 500),
    category: (splat.category || 'Communauté').slice(0, 100),
    isUserOriginal: false,
    createdAt: splat.createdAt || new Date().toISOString().split('T')[0],
  };

  if (splat.posterUrl) {
    payload.posterUrl = splat.posterUrl.slice(0, 500);
  }
  if (splat.splatCount) {
    payload.splatCount = splat.splatCount.slice(0, 100);
  }
  if (splat.captureNotes) {
    payload.captureNotes = splat.captureNotes.slice(0, 500);
  }

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SPLATS_PATH}/${sanitizedId}`);
  }
}

/**
 * Delete a user contributed splat from Firestore
 */
export async function deleteSplatFromFirestore(id: string): Promise<void> {
  const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const docRef = doc(db, SPLATS_PATH, sanitizedId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${SPLATS_PATH}/${sanitizedId}`);
  }
}

/**
 * Update the description of an existing splat in Firestore
 */
export async function updateSplatDescriptionInFirestore(id: string, description: string): Promise<void> {
  const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const docRef = doc(db, SPLATS_PATH, sanitizedId);
  try {
    await updateDoc(docRef, {
      description: (description || '').slice(0, 1000),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SPLATS_PATH}/${sanitizedId}`);
  }
}
