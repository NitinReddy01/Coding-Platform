/**
 * Redux store configuration and typed hooks
 *
 * Configures the global Redux store with Redux Toolkit and provides
 * type-safe hooks for accessing state and dispatching actions.
 *
 * Only manages truly global state (editor settings). Problem and submission
 * state is managed locally via hooks for better separation of concerns.
 *
 * @module store
 */

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import editorReducer from './slices/editorSlice';
import authReducer from './slices/authSlice';
import problemsReducer from './slices/problemsSlice';

/**
 * Global Redux store
 *
 * Contains global state slices:
 * - `editor`: Code editor state (code, language, theme, font size)
 * - `auth`: Authentication state (access token, user, isAuthenticated)
 *
 * Note: Problem and submission state are managed locally in their
 * respective hooks (useProblem, useSubmission) as they don't need
 * to be globally accessible.
 *
 * @see {@link https://redux-toolkit.js.org/api/configureStore | Redux Toolkit configureStore}
 */
export const store = configureStore({
  reducer: {
    editor: editorReducer,
    auth: authReducer,
    problems: problemsReducer,
  },
});

/**
 * Type representing the entire Redux state tree
 *
 * Use this type when accessing state in selectors or components.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Type for dispatch function with all action types
 *
 * Use this when dispatching thunks or for typing dispatch parameters.
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Type-safe hook for dispatching actions
 *
 * Provides full TypeScript support for action creators and thunks.
 *
 * @example
 * ```typescript
 * const dispatch = useAppDispatch();
 * dispatch(setProblem(problemData));
 * ```
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Type-safe hook for selecting state
 *
 * Provides full TypeScript support and autocomplete for state access.
 *
 * @example
 * ```typescript
 * const { code, language } = useAppSelector((state) => state.editor);
 * const problem = useAppSelector((state) => state.problem.data);
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
