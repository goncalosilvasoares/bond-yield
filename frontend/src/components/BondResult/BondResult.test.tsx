import { render, screen } from '@testing-library/react';
import { BondResult, BondResultType } from './BondResult';
jest.mock('../../i18n', () => ({ t: (key: string) => {
  const map: Record<string, string> = {
    'results.title': 'Results',
    'results.currentYield': 'Current Yield',
    'results.ytm': 'Yield to Maturity',
    'results.totalInterest': 'Total Interest',
    'results.premiumOrDiscount': 'Premium/Discount',
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
    expect(screen.getByText('Current Yield')).toBeInTheDocument();
    expect(screen.getByText('Yield to Maturity')).toBeInTheDocument();
    expect(screen.getByText('Total Interest')).toBeInTheDocument();
    expect(screen.getByText('Premium/Discount')).toBeInTheDocument();
    expect(screen.getByText('5.26%')).toBeInTheDocument();
    expect(screen.getByText('6.12%')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('Discount')).toBeInTheDocument();
  });
});
