export async function calculateBond(data: {
  faceValue: number;
  annualCouponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: number;
}) {
  const baseUrl = process.env.REACT_APP_BOND_API_URL;
  const res = await fetch(`${baseUrl}/bond/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        msg = json.message || JSON.stringify(json);
      } else {
        msg = await res.text();
      }
    } catch (e) {
      msg = 'An unexpected error occurred.';
    }
    throw new Error(msg);
  }
  return res.json();
}