import { useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setCode } from '../../store/slices/editorSlice';

interface CodeEditorProps {
  runCodeFn?: (code: string, language: string, problemId: string) => void;
  submitCodeFn?: (code: string, language: string, problemId: string) => void;
  problemId?: string;
  isDisabled?: boolean;
}

export function CodeEditor({ runCodeFn, submitCodeFn, problemId, isDisabled = false }: CodeEditorProps) {
  const dispatch = useAppDispatch();
  const { code, language, fontSize, theme, languages } = useAppSelector((state) => state.editor);

  // Use refs to access latest values in Monaco commands
  const languageRef = useRef(language);
  const problemIdRef = useRef(problemId);
  const isDisabledRef = useRef(isDisabled);

  // Update refs when values change
  languageRef.current = language;
  problemIdRef.current = problemId;
  isDisabledRef.current = isDisabled;

  const languageConfig = languages.find((lang) => lang.code === language);
  const monacoLanguage = languageConfig?.monaco_id || 'python';

  const handleEditorChange = (value: string | undefined) => {
    dispatch(setCode(value || ''));
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Register keyboard shortcuts in Monaco Editor
    // These take priority over Monaco's default behaviors
    // We use refs to access the latest values without stale closures

    // Cmd+' or Ctrl+' - Run Code
    if (runCodeFn) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote, () => {
        // Access current editor content directly from Monaco
        const currentCode = editor.getValue();
        const currentLanguage = languageRef.current;
        const currentProblemId = problemIdRef.current;
        const currentIsDisabled = isDisabledRef.current;

        if (!currentIsDisabled && currentProblemId && currentCode.trim()) {
          runCodeFn(currentCode, currentLanguage, currentProblemId);
        }
      });
    }

    // Cmd+Enter or Ctrl+Enter - Submit Code
    if (submitCodeFn) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        // Access current editor content directly from Monaco
        const currentCode = editor.getValue();
        const currentLanguage = languageRef.current;
        const currentProblemId = problemIdRef.current;
        const currentIsDisabled = isDisabledRef.current;

        if (!currentIsDisabled && currentProblemId && currentCode.trim()) {
          submitCodeFn(currentCode, currentLanguage, currentProblemId);
        }
      });
    }
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        theme={theme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize,
          fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          padding: { top: 16, bottom: 16 },
        }}
        loading={
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading editor...</p>
          </div>
        }
      />
    </div>
  );
}
