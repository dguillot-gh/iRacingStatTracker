# Development Guide

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher
- Git
- A modern IDE (VS Code recommended)
- Browser with good developer tools (Chrome/Firefox recommended)

### Setting Up Development Environment

1. **Clone the Repository**
```bash
git clone <repository-url>
cd iracingstattracker
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Access the Application**
- Open http://localhost:5173 in your browser
- Open browser developer tools
- Check the Console for any errors
- Use the Application tab to inspect localStorage

## Project Structure

```
iracingstattracker/
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # Business logic and utilities
│   ├── store/            # Redux store configuration
│   ├── styles/           # Global styles and themes
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
└── docs/                 # Documentation
```

## Key Technologies

### Core
- React 19 with Hooks
- TypeScript for type safety
- Vite for fast development
- Material-UI for components

### State Management
- Redux Toolkit for global state
- React Context for theme
- localStorage for persistence

### Testing
- Vitest for unit tests
- React Testing Library
- MSW for API mocking

## Development Workflow

### 1. Creating New Components

```typescript
// src/components/MyComponent.tsx
import { useState } from 'react'
import { Box, Typography } from '@mui/material'

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <Box>
      <Typography>{title}</Typography>
    </Box>
  );
}
```

### 2. Adding New Features

1. Create feature branch
2. Implement components
3. Add tests
4. Update documentation
5. Create pull request

### 3. State Management

```typescript
// src/store/slices/mySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyState {
  data: string[];
  loading: boolean;
}

const initialState: MyState = {
  data: [],
  loading: false,
};

export const mySlice = createSlice({
  name: 'my',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<string[]>) => {
      state.data = action.payload;
    },
  },
});
```

### 4. Using Custom Hooks

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

## Best Practices

### Code Style
- Use functional components
- Implement proper TypeScript types
- Follow Material-UI patterns
- Use meaningful variable names
- Add JSDoc comments for complex logic

### Performance
- Memoize expensive calculations
- Use React.memo for pure components
- Implement virtualization for long lists
- Optimize re-renders
- Profile with React DevTools

### Error Handling
```typescript
try {
  // Risky operation
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
}
```

### Testing
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" onAction={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Common Tasks

### Adding a New Page
1. Create page component in `src/pages`
2. Add route in `App.tsx`
3. Update navigation
4. Add tests
5. Update documentation

### Implementing Data Storage
1. Define data structure
2. Create storage service
3. Implement CRUD operations
4. Add error handling
5. Update types

### Styling Components
```typescript
import { styled } from '@mui/material/styles';

const StyledComponent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));
```

## Debugging Tips

### React DevTools
- Component inspection
- Performance profiling
- State tracking
- Hook debugging

### Browser DevTools
- Network requests
- localStorage inspection
- Console logging
- Performance monitoring

### Common Issues
1. State updates not reflecting
2. Component re-render issues
3. Type errors
4. Storage quota exceeded

## Pull Request Guidelines

1. **Branch Naming**
   - feature/feature-name
   - bugfix/issue-description
   - refactor/component-name

2. **Commit Messages**
   - Clear and descriptive
   - Reference issues
   - Use conventional commits

3. **PR Description**
   - What changes were made
   - Why changes were needed
   - How to test changes
   - Screenshots if applicable

4. **Checklist**
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No console errors
   - [ ] Code formatted
   - [ ] Types checked

## Deployment

### Building for Production
```bash
# Create production build
npm run build

# Preview build
npm run preview
```

### Docker Deployment
```bash
# Build container
docker-compose build

# Start container
docker-compose up -d
```

## Additional Resources

- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Redux Toolkit Guide](https://redux-toolkit.js.org)
- [Vite Documentation](https://vitejs.dev) 