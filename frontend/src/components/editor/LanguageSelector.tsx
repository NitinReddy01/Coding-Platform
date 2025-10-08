import { Select } from '../ui/select';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setLanguage, setCode } from '../../store/slices/editorSlice';
import { LANGUAGES, getDefaultCode } from '../../constants/languages';

export function LanguageSelector() {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.editor);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    dispatch(setLanguage(newLanguage));
    // Set default code for the selected language
    dispatch(setCode(getDefaultCode(newLanguage)));
  };

  return (
    <Select value={language} onChange={handleLanguageChange} className="w-40">
      {LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </Select>
  );
}
