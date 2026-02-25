import { render, screen } from '@testing-library/react';
import { CashFlowTable, CashFlowEntry } from './CashFlowTable';
jest.mock('../../i18n', () => ({ t: (key: string) => {
  const map: Record<string, string> = {
    'schedule.title': 'Cash Flow Schedule',
    'schedule.period': 'Period',
    'schedule.paymentDate': 'Payment Date',
    'schedule.couponPayment': 'Coupon Payment',
    'schedule.cumulativeInterest': 'Cumulative Interest',
    'schedule.remainingPrincipal': 'Remaining Principal',
  };
  return map[key] || key;
}}));

describe('CashFlowTable', () => {
  const schedule: CashFlowEntry[] = [
    {
      period: 1,
      paymentDate: '2026-08-23T00:00:00Z',
      couponPayment: 25,
      cumulativeInterest: 25,
      remainingPrincipal: 1000,
    },
    {
      period: 2,
      paymentDate: '2027-02-23T00:00:00Z',
      couponPayment: 25,
      cumulativeInterest: 50,
      remainingPrincipal: 1000,
    },
  ];

  it('renders cash flow schedule table', () => {
    render(<CashFlowTable schedule={schedule} />);
    expect(screen.getByText(/Cash Flow Schedule/i)).toBeInTheDocument();
    expect(screen.getByText('Period')).toBeInTheDocument();
    expect(screen.getByText('Payment Date')).toBeInTheDocument();
    expect(screen.getByText('Coupon Payment')).toBeInTheDocument();
    expect(screen.getByText('Cumulative Interest')).toBeInTheDocument();
    expect(screen.getByText('Remaining Principal')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('23-08-2026')).toBeInTheDocument();
    // There are three '25' values in the table (two coupon payments, one cumulative interest)
    expect(screen.getAllByText('25').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('1000').length).toBeGreaterThanOrEqual(2);
  });

  it('renders Export CSV button', () => {
    render(<CashFlowTable schedule={schedule} />);
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });
});
