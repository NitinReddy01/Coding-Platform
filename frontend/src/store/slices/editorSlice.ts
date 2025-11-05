import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '../../types';
interface EditorState {
  code: string;
  language: string;
  fontSize: number;
  theme: 'vs-dark' | 'light';
  languages: Language[];
  languagesLoading: boolean;
  languagesError: string | null;
}

const initialState: EditorState = {
  code: '',
  language: 'python',
  fontSize: 14,
  theme: 'vs-dark',
  languages: [],
  languagesLoading: false,
  languagesError: null,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload;
    },

    setTheme: (state, action: PayloadAction<'vs-dark' | 'light'>) => {
      state.theme = action.payload;
    },

    resetEditor: (state) => {
      state.code = '';
      state.language = 'python';
      state.fontSize = 14;
      state.theme = 'vs-dark';
    },
 
    setLanguagesLoading: (state, action: PayloadAction<boolean>) => {
      state.languagesLoading = action.payload;
    },

    setLanguages: (state, action: PayloadAction<Language[]>) => {
      state.languages = action.payload;
      state.languagesLoading = false;
      state.languagesError = null;
    },

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
