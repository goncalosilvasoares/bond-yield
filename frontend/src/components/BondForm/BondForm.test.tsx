
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BondForm } from './BondForm';
import * as bondService from '../../services/bondService';

describe('BondForm', () => {
  beforeEach(() => {
    jest.spyOn(bondService, 'calculateBond').mockResolvedValue({ result: 'mockResult' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all fields and submits', async () => {
    const onSuccess = jest.fn();
    render(<BondForm onSuccess={onSuccess} />);

    // Check all fields are present
    expect(screen.getByLabelText(/Face Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual Coupon Rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Market Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Years to Maturity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Coupon Frequency/i)).toBeInTheDocument();

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Face Value/i), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText(/Annual Coupon Rate/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Market Price/i), { target: { value: '950' } });
    fireEvent.change(screen.getByLabelText(/Years to Maturity/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Coupon Frequency/i), { target: { value: '2' } });

    // Submit the form
    fireEvent.submit(screen.getByRole('button'));

    // Wait for onSuccess to be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ result: 'mockResult' });
    });
  });
});
