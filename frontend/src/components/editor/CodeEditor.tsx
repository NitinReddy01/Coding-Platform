import Editor from '@monaco-editor/react';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { setCode } from '../../store/slices/editorSlice';
import { getLanguageById } from '../../constants/languages';

export function CodeEditor() {
  const dispatch = useAppDispatch();
  const { code, language, fontSize, theme } = useAppSelector((state) => state.editor);

  const languageConfig = getLanguageById(language);
  const monacoLanguage = languageConfig?.monacoId || 'python';

  const handleEditorChange = (value: string | undefined) => {
    dispatch(setCode(value || ''));
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        theme={theme}
        onChange={handleEditorChange}
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
