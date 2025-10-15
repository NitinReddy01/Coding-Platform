/**
 * @deprecated This file is deprecated. Language configurations are now fetched from the backend.
 *
 * Language data is:
 * 1. Fetched from backend API: GET /api/problems/languages
 * 2. Stored in Redux: state.editor.languages
 * 3. Loaded in PersistLogin component after authentication
 *
 * To access languages:
 * ```typescript
 * const { languages } = useAppSelector((state) => state.editor);
 * ```
 *
 * To add new languages, update:
 * - Backend: backend/internal/lib/constants.go
 * - Backend model: backend/internal/models/submission.go (Languages struct)
 *
 * @module constants/languages
 */

// This file is kept for reference but no longer exports any data or functions.
// All language management has been moved to Redux and backend.
