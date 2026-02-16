import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PDFPro Suite', () => {
  render(<App />);
  const heading = screen.getByText(/Welcome to PDFPro Suite/i);
  expect(heading).toBeInTheDocument();
});
