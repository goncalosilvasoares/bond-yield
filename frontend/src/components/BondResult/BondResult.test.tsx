import { render, screen } from '@testing-library/react';
import { BondResult, BondResultType } from './BondResult';
jest.mock('../../i18n', () => ({ t: (key: string) => {
  const map: Record<string, string> = {
    resultsTitle: 'Results',
    currentYield: 'Current Yield',
    ytm: 'Yield to Maturity',
    totalInterest: 'Total Interest',
    premiumOrDiscount: 'Premium/Discount',
  };
  return map[key] || key;
}}));

describe('BondResult', () => {
  const result: BondResultType = {
    currentYield: 5.26,
    ytm: 6.12,
    totalInterest: 250,
    premiumOrDiscount: 'discount',
  };

  it('renders bond result values', () => {
    render(<BondResult result={result} />);
    expect(screen.getByText(/Current Yield/i)).toBeInTheDocument();
    expect(screen.getByText(/Yield to Maturity/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Interest/i)).toBeInTheDocument();
    expect(screen.getByText(/Premium\/Discount/i)).toBeInTheDocument();
    expect(screen.getByText('5.26%')).toBeInTheDocument();
    expect(screen.getByText('6.12%')).toBeInTheDocument();
  expect(screen.getByText('250%')).toBeInTheDocument();
  expect(screen.getByText('discount%')).toBeInTheDocument();
  });
});
