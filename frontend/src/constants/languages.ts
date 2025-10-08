/**
 * Programming language configurations and utilities
 *
 * Defines supported languages with their Monaco editor settings
 * and default code templates.
 *
 * @module constants/languages
 */

/**
 * Configuration for a supported programming language
 */
export interface LanguageConfig {
  /** Unique identifier used in API requests (e.g., 'python', 'java') */
  id: string;
  /** Display name shown to users (e.g., 'Python 3') */
  name: string;
  /** Monaco editor language ID for syntax highlighting */
  monacoId: string;
  /** Default starter code template */
  defaultCode: string;
}

/**
 * List of all supported programming languages
 *
 * Add new languages here to enable them throughout the application.
 * Ensure the backend supports the language ID.
 */
export const LANGUAGES: LanguageConfig[] = [
  {
    id: 'python',
    name: 'Python 3',
    monacoId: 'python',
    defaultCode: `# Write your solution here
def solution():
    pass

if __name__ == "__main__":
    solution()
`,
  },
  {
    id: 'java',
    name: 'Java 17',
    monacoId: 'java',
    defaultCode: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}
`,
  },
  {
    id: 'cpp',
    name: 'C++17',
    monacoId: 'cpp',
    defaultCode: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}
`,
  },
];

/**
 * Finds a language configuration by its ID
 *
 * @param id - Language identifier (e.g., 'python')
 * @returns Language configuration if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const python = getLanguageById('python');
 * console.log(python?.name); // "Python 3"
 * ```
 */
export const getLanguageById = (id: string): LanguageConfig | undefined => {
  return LANGUAGES.find((lang) => lang.id === id);
};

/**
 * Gets the default code template for a language
 *
 * @param languageId - Language identifier
 * @returns Default code string, empty string if language not found
 *
 * @example
 * ```typescript
 * const code = getDefaultCode('python');
 * // Returns Python template with "# Write your solution here..."
 * ```
 */
export const getDefaultCode = (languageId: string): string => {
  const language = getLanguageById(languageId);
  return language?.defaultCode || '';
};
