/**
 * Phase 0 Security Specification Test Suite (Dirty Dozen Verification)
 * Run against Firebase Rules Unit Testing when emulator is active.
 */

export const DIRTY_DOZEN_CASES = [
  { name: 'Unauthenticated read /users/alice', expected: 'PERMISSION_DENIED' },
  { name: 'Cross-user read bob -> /users/alice', expected: 'PERMISSION_DENIED' },
  { name: 'Collection list /users', expected: 'PERMISSION_DENIED' },
  { name: 'Identity spoof uid=bob on /users/alice', expected: 'PERMISSION_DENIED' },
  { name: 'Shadow field injection isAdmin=true', expected: 'PERMISSION_DENIED' },
  { name: 'Forged createdAt timestamp != request.time', expected: 'PERMISSION_DENIED' },
  { name: 'Mutating immutable createdAt on update', expected: 'PERMISSION_DENIED' },
  { name: 'Out-of-range xp=-50 or hearts=99', expected: 'PERMISSION_DENIED' },
  { name: 'Path variable poisoning lessonId=bad..id', expected: 'PERMISSION_DENIED' },
  { name: 'Out-of-bounds bestScore=500 on lessonProgress', expected: 'PERMISSION_DENIED' },
  { name: '1KB+ feedback overflow (>1000 chars)', expected: 'PERMISSION_DENIED' },
  { name: 'Invalid mode="hacked" or update on practiceSessions', expected: 'PERMISSION_DENIED' },
] as const;
