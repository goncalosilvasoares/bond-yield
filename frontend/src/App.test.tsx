import React from 'react';

// Smoke test to ensure App renders without crashing
import { render } from '@testing-library/react';
import App from './App';

test('renders App without crashing', () => {
  render(<App />);
});
