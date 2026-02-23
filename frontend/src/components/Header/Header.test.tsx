import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders logo and title', () => {
    render(<Header />);
    expect(screen.getByAltText(/Genesis Logo/i)).toBeInTheDocument();
    expect(screen.getByText(/Bond Yield Calculator/i)).toBeInTheDocument();
  });
});
