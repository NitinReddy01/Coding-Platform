import { Code2 } from 'lucide-react';
import { Select } from '../ui/select';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLanguage, setCode } from '../../store/slices/editorSlice';
import { memo } from 'react';

/**
 * Language selector component
 *
 * Reads available languages from Redux store (fetched in PersistLogin).
 * When language changes, updates both language and code (with default template).
 */
function LanguageSelectorComponent() {
  const dispatch = useAppDispatch();
  const { language, languages } = useAppSelector((state) => state.editor);

  /**
   * Handle language change
   * Updates both the language and sets the default code template
   */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguageCode = e.target.value;
    const selectedLanguage = languages.find((lang) => lang.code === newLanguageCode);

    if (selectedLanguage) {
      dispatch(setLanguage(newLanguageCode));
      // Set default code for the selected language from backend data
      dispatch(setCode(selectedLanguage.default_code));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
        <Code2 className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Language</span>
      </div>
      <Select value={language} onChange={handleLanguageChange} className="w-44">
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.language}
          </option>
        ))}
      </Select>
    </div>
  );
}

// Memoize to prevent re-renders when parent component changes
export const LanguageSelector = memo(LanguageSelectorComponent);
