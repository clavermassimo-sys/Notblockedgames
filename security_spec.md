# Security Specification for Unblocked Game Hub

## Data Invariants
- A message must have a valid `text` (1-500 chars).
- `userId` must match the authenticated user.
- `createdAt` must be the server timestamp.
- Messages are immutable (no updates or deletes).

## The Dirty Dozen Payloads (Rejection Tests)
1. Message with missing `text`.
2. Message with `text` > 500 chars.
3. Message with spoofed `userId` (not matching auth.uid).
4. Message with client-provided `createdAt`.
5. Attempting to update a message.
6. Attempting to delete a message.
7. Unauthenticated read attempt.
8. Unauthenticated write attempt.
9. Message with additional "ghost" fields.
10. Message with empty `userName`.
11. Large message payload (> 1KB).
12. Invalid document ID (too long).

## Test Runner logic (Conceptual)
Tests will verify that all above payloads return PERMISSION_DENIED using the Firebase Rules Emulator (if available) or static analysis.
