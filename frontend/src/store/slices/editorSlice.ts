/**
 * Redux slice for code editor state management
 *
 * Manages the editor's code content, selected language, theme, and font size.
 * Used by the CodeEditor and EditorToolbar components.
 *
 * @module store/slices/editorSlice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '../../types';

/**
 * State shape for the editor slice
 */
interface EditorState {
  /** Current code in the editor */
  code: string;
  /** Selected programming language (e.g., 'python', 'java', 'cpp') */
  language: string;
  /** Editor font size in pixels */
  fontSize: number;
  /** Monaco editor theme */
  theme: 'vs-dark' | 'light';
  /** Available programming languages fetched from backend */
  languages: Language[];
  /** Loading state for language fetching */
  languagesLoading: boolean;
  /** Error message if language fetching failed */
  languagesError: string | null;
}

/**
 * Initial state for the editor slice
 *
 * Defaults: Python, dark theme, 14px font, empty code, no languages loaded
 */
const initialState: EditorState = {
  code: '',
  language: 'python',
  fontSize: 14,
  theme: 'vs-dark',
  languages: [],
  languagesLoading: false,
  languagesError: null,
};

/**
 * Editor slice - manages Monaco editor configuration and code
 *
 * Actions:
 * - `setCode`: Update code content
 * - `setLanguage`: Change programming language (also resets code to default template)
 * - `setFontSize`: Adjust font size
 * - `setTheme`: Switch editor theme
 * - `resetEditor`: Reset to initial state
 */
const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    /**
     * Sets the code content in the editor
     */
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    /**
     * Sets the selected programming language
     *
     * Note: Language changes should trigger default code template loading
     * in the component using this action.
     */
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    /**
     * Sets the editor font size in pixels
     */
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },
    /**
     * Sets the Monaco editor theme
     */
    setTheme: (state, action: PayloadAction<'vs-dark' | 'light'>) => {
      state.theme = action.payload;
    },
    /**
     * Resets the editor to its initial state
     *
     * Useful when navigating to a new problem or clearing work.
     */
    resetEditor: (state) => {
      state.code = '';
      state.language = 'python';
      state.fontSize = 14;
      state.theme = 'vs-dark';
    },
    /**
     * Sets the loading state for language fetching
     */
    setLanguagesLoading: (state, action: PayloadAction<boolean>) => {
      state.languagesLoading = action.payload;
    },
    /**
     * Stores the fetched languages array
     */
    setLanguages: (state, action: PayloadAction<Language[]>) => {
      state.languages = action.payload;
      state.languagesLoading = false;
      state.languagesError = null;
    },
    /**
     * Sets an error message if language fetching failed
     */
    setLanguagesError: (state, action: PayloadAction<string>) => {
      state.languagesError = action.payload;
      state.languagesLoading = false;
    },
  },
});

export const {
  setCode,
  setLanguage,
  setFontSize,
  setTheme,
  resetEditor,
  setLanguagesLoading,
  setLanguages,
  setLanguagesError,
} = editorSlice.actions;

export default editorSlice.reducer;
