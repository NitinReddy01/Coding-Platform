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
}

/**
 * Initial state for the editor slice
 *
 * Defaults: Python, dark theme, 14px font, empty code
 */
const initialState: EditorState = {
  code: '',
  language: 'python',
  fontSize: 14,
  theme: 'vs-dark',
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
  },
});

export const {
  setCode,
  setLanguage,
  setFontSize,
  setTheme,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
