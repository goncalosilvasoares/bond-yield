export async function calculateBond(data: {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: number;
}) {
  const baseUrl = process.env.REACT_APP_BOND_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/bond/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  return res.json();
}