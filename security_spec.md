# Security Specification — The Puh Coach

## 1. Data Invariants
1. Every document under `/users/{userId}` and its subcollections (`lessonProgress`, `practiceSessions`) belongs strictly to `userId == request.auth.uid`, and `request.auth.token.email_verified == true`.
2. `UserProfile` documents cannot be read, listed, created, updated, or deleted by any other user.
3. `LessonProgress` documents must match `lessonId` regex `^L(10|[1-9])-[0-9]{2}$`, `levelId` integer in `1..10`, `bestScore` integer in `0..100`, `attempts >= 1`, and require `exists(/databases/$(database)/documents/users/$(userId))`.
4. `PracticeSession` documents are append-only logs owned by `userId` with `mode` in `['voice', 'text']`, `score` in `0..100`, and `createdAt == request.time`.
5. No user can spoof `uid`/`userId`, mutate `createdAt`, or inject unvalidated shadow fields (`hasOnly()` enforced on both create and `affectedKeys()` on update).

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated read of `/users/alice`.
2. Authenticated user `bob` reading `/users/alice` (`get`).
3. Authenticated user `bob` listing `/users` collection.
4. User `alice` creating `/users/alice` with `uid: "bob"` (Identity spoofing).
5. User `alice` creating `/users/alice` with `isAdmin: true` (Shadow / privilege field injection).
6. User `alice` creating `/users/alice` with `createdAt` set to a client-chosen timestamp != `request.time`.
7. User `alice` updating `/users/alice` to mutate immutable `createdAt` or `uid`.
8. User `alice` updating `/users/alice` with `xp: -50` or `hearts: 99`.
9. User `alice` creating `/users/alice/lessonProgress/bad..id` (Path variable ID poisoning).
10. User `alice` creating `/users/alice/lessonProgress/L1-01` with `bestScore: 500` or `levelId: 99`.
11. User `alice` updating `/users/alice/lessonProgress/L1-01` with `lastFeedbackSummary` > 1000 chars (Resource exhaustion).
12. User `alice` creating `/users/alice/practiceSessions/s1` with `mode: "hacked"` or updating an existing `practiceSessions` doc.
