import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders EchoSoul AI Platform', () => {
  render(<App />);
  const titleElement = screen.getByText(/EchoSoul AI Platform/i);
  expect(titleElement).toBeInTheDocument();
});