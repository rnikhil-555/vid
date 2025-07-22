import { Language } from '@/types/live-tv';

interface LanguageFilterProps {
    languages: Language[];
    selectedLanguage: string;
    onSelectLanguage: (languageCode: string) => void;
}

export default function LanguageFilter({
    languages,
    selectedLanguage,
    onSelectLanguage
}: LanguageFilterProps) {
    return (
        <div className="mb-4">
            <label htmlFor="language-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
            </label>
            <select
                id="language-filter"
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedLanguage}
                onChange={(e) => onSelectLanguage(e.target.value)}
            >
                <option value="">All Languages</option>
                {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                        {language.name}
                    </option>
                ))}
            </select>
        </div>
    );
}