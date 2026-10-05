/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  remove as rtdbRemove,
  onValue as rtdbOnValue,
  Database
} from 'firebase/database';

import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserRole, DepartmentId, ShiftRosterData } from '../types/nursing';

// 1. Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Authentication
export const auth = getAuth(app);

// 3. Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 4. Initialize Realtime Database
const rtdbUrl =
  (firebaseConfig as Record<string, unknown>).databaseURL as string ||
  `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;

let rtdbInstance: Database | null = null;
try {
  rtdbInstance = getDatabase(app, rtdbUrl);
} catch (e) {
  try {
    rtdbInstance = getDatabase(app);
  } catch (err) {
    console.warn('Realtime Database fallback initialized with default URL', err);
  }
}
export const realtimeDb = rtdbInstance;

// Test server connectivity
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
  }
}
testFirestoreConnection();

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted: string;
  fileData?: string; // Base64 data URL or text snippet
  departmentId: DepartmentId | 'all';
  category: 'ROSTER' | 'CENSUS' | 'ACTIVITY' | 'REPORT' | 'OTHER';
  uploadedBy: string;
  uploadedByUid: string;
  uploadedByEmail: string;
  uploadedAt: string;
  parsedSummary?: string;
}

// -------------------------------------------------------------
// Authentication Functions (Email & Password)
// -------------------------------------------------------------

/**
 * Register a new user account with Email & Password
 */
export async function registerWithEmailPassword(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole,
  roleTitle: string,
  departmentId: DepartmentId | 'all'
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Update Auth Profile Display Name
  await updateProfile(user, {
    displayName: displayName,
  });

  const profile: UserProfile = {
    id: user.uid,
    username: email.split('@')[0],
    name: displayName,
    email: user.email || email,
    role: role,
    roleTitle: roleTitle,
    roleLevel: role === 'director' ? 1 : role === 'head_nurse' ? 2 : role === 'staff_nurse' ? 3 : 4,
    departmentId: departmentId,
    departmentName: departmentId === 'all' ? 'ทุกแผนก' : departmentId.toUpperCase(),
    licenseNo: 'RN-ONLINE',
    pin: '1234',
    avatarUrl: `https://images.unsplash.com/photo-1594824813583-e18e388efb7a?w=150&auto=format&fit=crop&q=80`,
  };

  // Sync to Realtime Database (/users/{uid})
  if (realtimeDb) {
    try {
      const userRef = rtdbRef(realtimeDb, `users/${user.uid}`);
      await rtdbSet(userRef, {
        ...profile,
        createdAt: new Date().toISOString(),
      });
    } catch (rtdbErr) {
      console.warn('Sync user to Realtime Database notice:', rtdbErr);
    }
  }

  // Sync to Firestore (/users/{uid})
  try {
    await setDoc(doc(db, 'users', user.uid), {
      ...profile,
      createdAt: new Date().toISOString(),
    });
  } catch (fsErr) {
    console.warn('Sync user to Firestore notice:', fsErr);
  }

  return profile;
}

/**
 * Sign in an existing user with Email & Password
 */
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Attempt to fetch custom profile from Realtime Database first
  let profileData: Partial<UserProfile> | null = null;

  if (realtimeDb) {
    try {
      const userSnapshot = await rtdbGet(rtdbRef(realtimeDb, `users/${user.uid}`));
      if (userSnapshot.exists()) {
        profileData = userSnapshot.val() as Partial<UserProfile>;
      }
    } catch (e) {
      console.warn('Fetch from Realtime Database notice:', e);
    }
  }

  // Fallback to Firestore if Realtime Database didn't have it
  if (!profileData) {
    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        profileData = docSnap.data() as Partial<UserProfile>;
      }
    } catch (e) {
      console.warn('Fetch from Firestore notice:', e);
    }
  }

  const profile: UserProfile = {
    id: user.uid,
    username: profileData?.username || user.email?.split('@')[0] || 'nurse_user',
    name: profileData?.name || user.displayName || user.email?.split('@')[0] || 'พยาบาลผู้ใช้งาน',
    email: user.email || email,
    role: (profileData?.role as UserRole) || 'staff_nurse',
    roleTitle: profileData?.roleTitle || 'พยาบาลวิชาชีพปฏิบัติการ (RN)',
    roleLevel: profileData?.roleLevel || 3,
    departmentId: (profileData?.departmentId as DepartmentId) || 'er',
    departmentName: profileData?.departmentName || 'แผนกการพยาบาล',
    licenseNo: profileData?.licenseNo || 'RN-ONLINE',
    pin: profileData?.pin || '1234',
    avatarUrl:
      profileData?.avatarUrl ||
      `https://images.unsplash.com/photo-1594824813583-e18e388efb7a?w=150&auto=format&fit=crop&q=80`,
  };

  return profile;
}

/**
 * Sign out current authenticated user
 */
export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen to Firebase Auth state changes
 */
export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Fetch all real users from Firestore
 */
export async function fetchUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const userList: UserProfile[] = [];
    snap.forEach((d) => {
      userList.push(d.data() as UserProfile);
    });
    return userList;
  } catch (error) {
    console.warn('fetchUsersFromFirestore notice:', error);
    return [];
  }
}

/**
 * Subscribe to real users collection in Firestore
 */
export function subscribeToUsers(callback: (users: UserProfile[]) => void): () => void {
  try {
    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const userList: UserProfile[] = [];
        snapshot.forEach((d) => {
          userList.push(d.data() as UserProfile);
        });
        if (userList.length > 0) {
          callback(userList);
        }
      },
      (error) => {
        console.warn('subscribeToUsers notice:', error);
      }
    );
  } catch (err) {
    console.warn('subscribeToUsers init error:', err);
    return () => {};
  }
}

// -------------------------------------------------------------
// Realtime Database & File Upload Integration
// -------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Save an uploaded file record into Firebase Realtime Database and Firestore
 */
export async function uploadFileToDatabase(
  file: File,
  departmentId: DepartmentId | 'all',
  category: 'ROSTER' | 'CENSUS' | 'ACTIVITY' | 'REPORT' | 'OTHER',
  user: UserProfile
): Promise<UploadedFileRecord> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  let fileData = '';
  let parsedSummary = '';

  try {
    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.txt')) {
      const text = await file.text();
      fileData = text.slice(0, 50000);
      parsedSummary = `ไฟล์ข้อความ/ตาราง: มี ${text.split('\n').length} แถวข้อมูล`;
    } else {
      fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
      parsedSummary = `เอกสารดิจิทัล (${file.type || 'binary'})`;
    }
  } catch (readErr) {
    console.warn('Could not read full file preview:', readErr);
    parsedSummary = 'อัปโหลดสำเร็จ';
  }

  const record: UploadedFileRecord = {
    id: fileId,
    fileName: file.name,
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size),
    fileData: fileData.slice(0, 150000),
    departmentId,
    category,
    uploadedBy: user.name,
    uploadedByUid: user.id,
    uploadedByEmail: user.email || '',
    uploadedAt: now,
    parsedSummary,
  };

  // 1. Write to Realtime Database (/uploaded_files/{fileId})
  if (realtimeDb) {
    try {
      const fileRef = rtdbRef(realtimeDb, `uploaded_files/${fileId}`);
      await rtdbSet(fileRef, record);
    } catch (rtdbErr) {
      console.warn('Realtime Database write note:', rtdbErr);
    }
  }

  // 2. Also write to Firestore collection (/uploaded_files/{fileId})
  try {
    await setDoc(doc(db, 'uploaded_files', fileId), record);
  } catch (fsErr) {
    console.warn('Firestore write note:', fsErr);
  }

  return record;
}

/**
 * Subscribe to Realtime Database files list with automatic fallback to Firestore
 */
export function subscribeToUploadedFiles(
  callback: (files: UploadedFileRecord[]) => void
): () => void {
  if (realtimeDb) {
    try {
      const filesRef = rtdbRef(realtimeDb, 'uploaded_files');
      const unsubscribeRtdb = rtdbOnValue(
        filesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list: UploadedFileRecord[] = Object.values(data);
            list.sort(
              (a, b) =>
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );
            callback(list);
          } else {
            callback([]);
          }
        },
        (error) => {
          console.warn('RTDB listener error, falling back to Firestore listener:', error);
          const unsubFs = onSnapshot(collection(db, 'uploaded_files'), (snap) => {
            const list: UploadedFileRecord[] = snap.docs.map(
              (d) => d.data() as UploadedFileRecord
            );
            list.sort(
              (a, b) =>
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );
            callback(list);
          });
          return unsubFs;
        }
      );
      return unsubscribeRtdb;
    } catch (err) {
      console.warn('RTDB initialization error, subscribing to Firestore:', err);
    }
  }

  const unsubFirestore = onSnapshot(collection(db, 'uploaded_files'), (snap) => {
    const list: UploadedFileRecord[] = snap.docs.map(
      (d) => d.data() as UploadedFileRecord
    );
    list.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    callback(list);
  });

  return unsubFirestore;
}

/**
 * Delete an uploaded file record from Realtime Database and Firestore
 */
export async function deleteUploadedFileRecord(fileId: string): Promise<void> {
  if (realtimeDb) {
    try {
      await rtdbRemove(rtdbRef(realtimeDb, `uploaded_files/${fileId}`));
    } catch (e) {
      console.warn('RTDB remove error:', e);
    }
  }

  try {
    await deleteDoc(doc(db, 'uploaded_files', fileId));
  } catch (e) {
    console.warn('Firestore remove error:', e);
  }
}

/**
 * Sync shift roster live to Realtime Database
 */
export async function syncRosterToRealtimeDb(deptId: DepartmentId, roster: ShiftRosterData): Promise<void> {
  if (realtimeDb) {
    try {
      await rtdbSet(rtdbRef(realtimeDb, `rosters/${deptId}`), {
        ...roster,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Sync roster to Realtime Database notice:', e);
    }
  }
}

/**
 * Save daily workload record by specific calendar date (supports past historical dates)
 */
export async function saveDailyWorkloadRecord(
  deptId: DepartmentId,
  date: string,
  roster: ShiftRosterData,
  savedByName?: string
): Promise<{ success: boolean; timestamp: string }> {
  const timestamp = new Date().toISOString();
  const recordWithMeta = {
    ...roster,
    departmentId: deptId,
    date,
    savedAt: timestamp,
    savedByName: savedByName || 'พยาบาลผู้ปฏิบัติการ',
  };

  // 1. Save to Realtime Database under /daily_workloads/{deptId}/{date}
  if (realtimeDb) {
    try {
      const dailyRef = rtdbRef(realtimeDb, `daily_workloads/${deptId}/${date}`);
      await rtdbSet(dailyRef, recordWithMeta);
      // Also update latest roster pointer
      const latestRef = rtdbRef(realtimeDb, `rosters/${deptId}`);
      await rtdbSet(latestRef, recordWithMeta);
    } catch (e) {
      console.warn('Realtime Database save error:', e);
    }
  }

  // 2. Also save to Firestore under daily_workloads collection
  try {
    const docId = `${deptId}_${date}`;
    await setDoc(doc(db, 'daily_workloads', docId), recordWithMeta);
  } catch (fsErr) {
    console.warn('Firestore daily_workload save notice:', fsErr);
  }

  return { success: true, timestamp };
}

/**
 * Fetch daily workload record by date from Realtime Database or Firestore
 */
export async function fetchDailyWorkloadRecord(
  deptId: DepartmentId,
  date: string
): Promise<ShiftRosterData | null> {
  if (realtimeDb) {
    try {
      const snap = await rtdbGet(rtdbRef(realtimeDb, `daily_workloads/${deptId}/${date}`));
      if (snap.exists()) {
        return snap.val() as ShiftRosterData;
      }
    } catch (e) {
      console.warn('Realtime Database fetch notice:', e);
    }
  }

  try {
    const docSnap = await getDoc(doc(db, 'daily_workloads', `${deptId}_${date}`));
    if (docSnap.exists()) {
      return docSnap.data() as ShiftRosterData;
    }
  } catch (e) {
    console.warn('Firestore fetch notice:', e);
  }

  return null;
}

/**
 * Delete a daily workload record from Firestore and Realtime Database
 */
export async function deleteDailyWorkloadRecord(deptId: DepartmentId, date: string): Promise<void> {
  if (realtimeDb) {
    try {
      await rtdbRemove(rtdbRef(realtimeDb, `daily_workloads/${deptId}/${date}`));
    } catch (e) {
      console.warn('Realtime Database workload delete error:', e);
    }
  }

  try {
    await deleteDoc(doc(db, 'daily_workloads', `${deptId}_${date}`));
  } catch (e) {
    console.warn('Firestore daily_workload delete error:', e);
  }
}

/**
 * Clean any remaining demo records while keeping user data strictly untouched
 */
export async function deleteDemoWorkloads(): Promise<{ deleted: number }> {
  let count = 0;
  try {
    const snap = await getDocs(collection(db, 'daily_workloads'));
    for (const d of snap.docs) {
      const data = d.data();
      // Identify demo records by mock date 2026-10-01 or mock nurse name
      if (
        data.date === '2026-10-01' ||
        data.savedByName === 'พว. ธีรภัทร ชาญวารี' ||
        d.id.includes('2026-10-01')
      ) {
        await deleteDoc(doc(db, 'daily_workloads', d.id));
        count++;
      }
    }
  } catch (err) {
    console.warn('deleteDemoWorkloads notice:', err);
  }
  return { deleted: count };
}

/**
 * Subscribe to shift roster updates from Realtime Database
 */
export function subscribeToRosterFromRealtimeDb(
  deptId: DepartmentId,
  callback: (roster: ShiftRosterData) => void
): () => void {
  if (realtimeDb) {
    try {
      const rosterRef = rtdbRef(realtimeDb, `rosters/${deptId}`);
      return rtdbOnValue(rosterRef, (snap) => {
        if (snap.exists()) {
          callback(snap.val() as ShiftRosterData);
        }
      });
    } catch (e) {
      console.warn('Subscribe roster error:', e);
    }
  }
  return () => {};
}
