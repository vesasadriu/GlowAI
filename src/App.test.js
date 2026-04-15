import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders GlowAI app correctly', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  // Tani testi do të kërkojë për titullin tonë të ri në vend të "learn react"
  const titleElement = screen.getAllByText(/GlowAI/i)[0];
  expect(titleElement).toBeInTheDocument();
});