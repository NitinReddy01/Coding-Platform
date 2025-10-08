# Frontend - Coding Platform

Modern React-based frontend for a LeetCode-style coding platform. Built with TypeScript, Redux Toolkit, and Tailwind CSS.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety and developer experience |
| **Redux Toolkit** | Global state management |
| **React Router** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling with custom dark theme |
| **Monaco Editor** | Professional code editor (VS Code's editor) |
| **Axios** | HTTP client for API requests |
| **Vite** | Fast build tool and dev server |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── api/                  # API client and endpoints
│   │   ├── client.ts         # Axios instance with interceptors
│   │   ├── problems.ts       # Problem fetching endpoints
│   │   └── submissions.ts    # Code execution endpoints
│   │
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── editor/          # Code editor components
│   │   ├── problem/         # Problem description components
│   │   ├── submission/      # Submission result components
│   │   └── layout/          # Layout components
│   │
│   ├── constants/           # App-wide constants
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components
│   ├── store/               # Redux state management
│   ├── types/               # TypeScript type definitions
│   │
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles and theme
│
├── .env                     # Environment variables
├── tailwind.config.js       # Tailwind configuration
└── vite.config.ts           # Vite configuration
```

## Architecture

### State Management (Redux Toolkit)

Redux is used **only for truly global state** - the code editor settings that persist across the app.

**Global State (Redux):**
- **Editor Slice** - Code, language, theme, font size

**Local State (Custom Hooks):**
- **useProblem** - Problem data, loading, error (managed locally in hook)
- **useSubmission** - Results, execution status, error (managed locally in hook)

```typescript
// Global state (Redux) - editor settings
const { code, language } = useAppSelector((state) => state.editor);
const dispatch = useAppDispatch();
dispatch(setCode('print("Hello World")'));

// Local state (Hooks) - component-specific data
const { problem, loading, error } = useProblem('123');
const { results, isRunning, runCode } = useSubmission();
```

**Why this architecture?**
- Problem/submission data is only used within ProblemPage and its children (2 levels deep)
- Props passing is simple and clean for this scope
- Redux DevTools still available for debugging editor state
- Easier to understand and maintain

### Custom Hooks

#### `useProblem(problemId, useMock?)`
Fetches and manages problem data.

```typescript
const { problem, loading, error, refetch } = useProblem('123', false);
```

#### `useSubmission(useMock?)`
Handles code execution and submission.

```typescript
const { results, isRunning, isSubmitting, error, runCode, submitCode } = useSubmission(false);
```

### API Layer

All API calls use axios with interceptors for authentication and error handling.

```typescript
// Configured in api/client.ts
- Base URL: VITE_API_BASE_URL or http://localhost:4000/api
- Timeout: 30 seconds
- Error handling: Automatic transformation to user-friendly messages
```

## Theme System

Custom **LeetCode-inspired dark theme** with softer, warmer grays.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#282828` | Main background |
| Card | `#2d2d2d` | Panels, surfaces |
| Border | `#3e3e3e` | Borders |
| Text | `#e0e0e0` | Foreground text |
| Primary | `#ffa116` | Orange accent |
| Success | `#00b8a3` | Easy, passed tests |
| Warning | `#ffc01e` | Medium difficulty |
| Destructive | `#ef4743` | Hard, failed tests |

All colors are available as Tailwind utilities:

```tsx
<div className="bg-background text-foreground border-border">
<Badge variant="success">Easy</Badge>
<Button variant="primary">Submit</Button>
```

### Customizing Theme

Edit colors in `src/index.css`:

```css
@theme {
  --color-background: 0 0% 16%;  /* HSL values */
  --color-primary: 38 100% 54%;
}
```

Then register in `tailwind.config.js` if adding new colors.

## Development Workflow

### Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

### Type Checking

```bash
npx tsc --noEmit
```

### Mock Mode

For development without a backend, set `useMock: true` in hooks:

```typescript
const { problem } = useProblem('1', true);  // Uses mock data
const { runCode } = useSubmission(true);     // Simulates execution
```

Edit mock data in `src/constants/mockData.ts`.

## Adding New Features

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `App.tsx`:
   ```typescript
   <Route path="/problems" element={<ProblemsListPage />} />
   ```

### Adding a New Redux Slice

**Only add Redux slices for truly global state** (data needed across multiple routes/pages).

For local state (used within one page tree), use custom hooks with `useState` instead.

1. Create slice in `src/store/slices/`
2. Register in `src/store/store.ts`:
   ```typescript
   export const store = configureStore({
     reducer: {
       editor: editorReducer,
       user: userReducer,  // Add if needed globally
     },
   });
   ```

**Example: User slice (global state)**
```typescript
// User data is needed in navbar, profile page, protected routes
const user = useAppSelector((state) => state.user.data);
```

**Example: Problem data (local state - use hook)**
```typescript
// Problem data only used in ProblemPage tree
const { problem } = useProblem(id);  // Manages state internally
```

### Adding a New Language

Add to `src/constants/languages.ts`:

```typescript
{
  id: 'rust',
  name: 'Rust',
  monacoId: 'rust',
  defaultCode: `fn main() {\n    // Code here\n}\n`,
}
```

**Note:** Backend must support the language.

### Creating a Component

```typescript
// src/components/ui/spinner.tsx
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  return <div className="animate-spin..." />;
}
```

## Best Practices

### State Management
- **Redux:** Only for truly global state (editor settings, user auth)
- **Custom hooks:** For feature-specific state with API logic (useProblem, useSubmission)
- **useState:** For component-specific UI state (modals, dropdowns, local toggles)
- **Rule of thumb:** If data is only used within one page/component tree, use hooks/local state

### Type Safety
- Define interfaces for all API responses
- Use `useAppSelector` and `useAppDispatch` for type-safe Redux
- Avoid `any` type

### Performance
- Use `React.memo()` for expensive components
- Lazy load pages with `React.lazy()` and `Suspense`
- Debounce expensive operations

### Styling
- Prefer Tailwind utilities over custom CSS
- Use `cn()` helper for conditional classes
- Follow theme color system

## Troubleshooting

### Port Already in Use
```bash
# Vite automatically tries another port
# Or kill process: lsof -ti:5173 | xargs kill -9
```

### Monaco Editor Not Loading
- Check network tab for CDN requests
- Verify `@monaco-editor/react` is installed

### Tailwind Classes Not Working
- Restart dev server
- Check `tailwind.config.js` content paths
- Verify `@import "tailwindcss";` in `index.css`

### TypeScript Errors
```bash
# Restart TS server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Documentation

All code includes JSDoc comments for IDE intellisense. Hover over any function, component, or type in VS Code to see documentation.

## Contributing

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Ensure TypeScript compiles
4. Test locally
5. Create pull request

## Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Vite](https://vitejs.dev/)
