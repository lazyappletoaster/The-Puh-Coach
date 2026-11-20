import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import type {
  UserProfile,
  LessonProgress,
  PracticeSession,
} from '../types/curriculum';

interface CoachAuthContextValue {
  user: User | null;
  authReady: boolean;
  authError: string | null;
  isSigningIn: boolean;
  profile: UserProfile | null;
  progressMap: Record<string, LessonProgress>;
  sessions: PracticeSession[];
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  recordLessonAttempt: (params: {
    lessonId: string;
    levelId: number;
    lessonTitle: string;
    mode: 'voice' | 'text';
    transcriptOrText: string;
    score: number;
    passed: boolean;
    xpReward: number;
    coachSummary: string;
    heartsRemaining: number;
  }) => Promise<void>;
  restoreHearts: () => Promise<void>;
}

const CoachAuthContext = createContext<CoachAuthContextValue | null>(null);

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toMillis(ts: unknown): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts && typeof ts === 'object' && 'seconds' in ts) {
    return Number((ts as { seconds: number }).seconds) * 1000;
  }
  return 0;
}

export function CoachAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (!firebaseUser) {
        setProfile(null);
        setProgressMap({});
        setSessions([]);
        return;
      }

      const userPath = `users/${firebaseUser.uid}`;
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const safeName = (firebaseUser.displayName || 'Speaker').trim().slice(0, 100) || 'Speaker';
          const initialPayload: Record<string, unknown> = {
            uid: firebaseUser.uid,
            displayName: safeName,
            xp: 0,
            streak: 0,
            hearts: 5,
            currentLevel: 1,
            completedLessonsCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (typeof firebaseUser.photoURL === 'string' && firebaseUser.photoURL.length > 0) {
            initialPayload.photoURL = firebaseUser.photoURL.slice(0, 500);
          }
          await setDoc(userRef, initialPayload);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userPath);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    );

    const progressCol = collection(db, 'users', user.uid, 'lessonProgress');
    const progressQuery = query(progressCol, where('userId', '==', user.uid));
    const unsubProgress = onSnapshot(
      progressQuery,
      (snap) => {
        const nextMap: Record<string, LessonProgress> = {};
        snap.forEach((d) => {
          const data = d.data() as LessonProgress;
          nextMap[data.lessonId] = data;
        });
        setProgressMap(nextMap);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/lessonProgress`);
      }
    );

    const sessionsCol = collection(db, 'users', user.uid, 'practiceSessions');
    const sessionsQuery = query(sessionsCol, where('userId', '==', user.uid));
    const unsubSessions = onSnapshot(
      sessionsQuery,
      (snap) => {
        const list: PracticeSession[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as PracticeSession) });
        });
        list.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setSessions(list.slice(0, 40));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/practiceSessions`);
      }
    );

    return () => {
      unsubProfile();
      unsubProgress();
      unsubSessions();
    };
  }, [authReady, user]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to sign in with Google.';
      setAuthError(msg);
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const recordLessonAttempt = useCallback(
    async ({
      lessonId,
      levelId,
      lessonTitle,
      mode,
      transcriptOrText,
      score,
      passed,
      xpReward,
      coachSummary,
      heartsRemaining,
    }: {
      lessonId: string;
      levelId: number;
      lessonTitle: string;
      mode: 'voice' | 'text';
      transcriptOrText: string;
      score: number;
      passed: boolean;
      xpReward: number;
      coachSummary: string;
      heartsRemaining: number;
    }) => {
      const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
      const safeTranscript = transcriptOrText.trim().slice(0, 2000) || '(No text)';
      const safeSummary = coachSummary.trim().slice(0, 1000) || 'Rep completed.';
      const safeTitle = lessonTitle.trim().slice(0, 150) || lessonId;
      const safeHearts = Math.max(0, Math.min(5, Math.round(heartsRemaining)));

      if (!user) {
        setProgressMap((prev) => {
          const existing = prev[lessonId];
          const wasCompleted = existing?.completed ?? false;
          const nowCompleted = wasCompleted || passed;
          return {
            ...prev,
            [lessonId]: {
              lessonId,
              userId: 'guest',
              levelId,
              bestScore: Math.max(existing?.bestScore ?? 0, clampedScore),
              attempts: (existing?.attempts ?? 0) + 1,
              completed: nowCompleted,
              lastFeedbackSummary: safeSummary,
            },
          };
        });
        setSessions((prev) => [
          {
            id: `local-${Date.now()}`,
            userId: 'guest',
            lessonId,
            lessonTitle: safeTitle,
            mode,
            transcriptOrText: safeTranscript,
            score: clampedScore,
            coachSummary: safeSummary,
          },
          ...prev.slice(0, 19),
        ]);
        return;
      }

      const progressPath = `users/${user.uid}/lessonProgress/${lessonId}`;
      const progressRef = doc(db, 'users', user.uid, 'lessonProgress', lessonId);
      const existingProgress = progressMap[lessonId];
      const wasCompleted = existingProgress?.completed ?? false;
      const isNowCompleted = wasCompleted || passed;

      try {
        if (!existingProgress) {
          await setDoc(progressRef, {
            lessonId,
            userId: user.uid,
            levelId,
            bestScore: clampedScore,
            attempts: 1,
            completed: isNowCompleted,
            lastFeedbackSummary: safeSummary,
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(progressRef, {
            bestScore: Math.max(existingProgress.bestScore, clampedScore),
            attempts: existingProgress.attempts + 1,
            completed: isNowCompleted,
            lastFeedbackSummary: safeSummary,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, progressPath);
      }

      const sessionsPath = `users/${user.uid}/practiceSessions`;
      try {
        await addDoc(collection(db, 'users', user.uid, 'practiceSessions'), {
          userId: user.uid,
          lessonId,
          lessonTitle: safeTitle,
          mode,
          transcriptOrText: safeTranscript,
          score: clampedScore,
          coachSummary: safeSummary,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, sessionsPath);
      }

      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();
      const currentProfile = profile;

      const prevStreak = currentProfile?.streak ?? 0;
      const lastDate = currentProfile?.lastPracticeDate;
      let nextStreak = prevStreak;
      if (lastDate === today) {
        nextStreak = Math.max(1, prevStreak);
      } else if (lastDate === yesterday) {
        nextStreak = prevStreak + 1;
      } else {
        nextStreak = 1;
      }

      const earnedXp = passed ? (wasCompleted ? Math.round(xpReward * 0.5) : xpReward) : 5;
      const newlyCompletedDelta = !wasCompleted && isNowCompleted ? 1 : 0;
      const nextCompletedCount = Math.min(
        250,
        (currentProfile?.completedLessonsCount ?? 0) + newlyCompletedDelta
      );
      const nextLevel = Math.min(
        10,
        Math.max(currentProfile?.currentLevel ?? 1, isNowCompleted && levelId < 10 ? levelId : levelId)
      );

      try {
        await updateDoc(userRef, {
          xp: (currentProfile?.xp ?? 0) + earnedXp,
          streak: nextStreak,
          lastPracticeDate: today,
          hearts: safeHearts,
          currentLevel: nextLevel,
          completedLessonsCount: nextCompletedCount,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      }
    },
    [user, progressMap, profile]
  );

  const restoreHearts = useCallback(async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        hearts: 5,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  }, [user]);

  return (
    <CoachAuthContext.Provider
      value={{
        user,
        authReady,
        authError,
        isSigningIn,
        profile,
        progressMap,
        sessions,
        signInWithGoogle,
        signOutUser,
        recordLessonAttempt,
        restoreHearts,
      }}
    >
      {children}
    </CoachAuthContext.Provider>
  );
}

export function useCoachAuth() {
  const ctx = useContext(CoachAuthContext);
  if (!ctx) {
    throw new Error('useCoachAuth must be used inside CoachAuthProvider');
  }
  return ctx;
}
