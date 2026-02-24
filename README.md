# Bond Yield Calculator

This project contains a full-stack bond yield calculator with a React frontend and a Node.js (NestJS) backend.

## Structure

- `frontend/` — React app for user input and result display
- `backend/` — NestJS API for bond calculations

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/goncalosilvasoares/bond-yield.git
   cd bond-yield
   ```
2. Install dependencies for both frontend and backend:
   ```sh
   cd frontend && npm install
   cd ../backend && npm install
   ```

### Running the App

#### Backend

```sh
cd backend
npm run start:dev
```

#### Frontend

```sh
cd frontend
npm start
```

The frontend will be available at http://localhost:3001 and the backend at http://localhost:3000 by default.

## Features

- Calculate bond current yield, yield to maturity, total interest, and premium/discount
- View cash flow schedule
- Modular React components and SCSS styling
- Internationalization support

## Example API Request/Response

### Request (POST /bond/calculate)

```json
{
  "faceValue": 1000,
  "annualCouponRate": 5,
  "marketPrice": 980,
  "yearsToMaturity": 2,
  "couponFrequency": 2
}
```

### Response

```json
{
  "currentYield": 5.1,
  "ytm": 6.2,
  "totalInterest": 100,
  "premiumOrDiscount": "discount",
  "cashFlowSchedule": [
    {
      "period": 1,
      "paymentDate": "2026-08-24T00:00:00.000Z",
      "couponPayment": 25,
      "cumulativeInterest": 25,
      "remainingPrincipal": 1000
    },
    {
      "period": 2,
      "paymentDate": "2027-02-24T00:00:00.000Z",
      "couponPayment": 25,
      "cumulativeInterest": 50,
      "remainingPrincipal": 1000
    },
    {
      "period": 3,
      "paymentDate": "2027-08-24T00:00:00.000Z",
      "couponPayment": 25,
      "cumulativeInterest": 75,
      "remainingPrincipal": 1000
    },
    {
      "period": 4,
      "paymentDate": "2028-02-24T00:00:00.000Z",
      "couponPayment": 25,
      "cumulativeInterest": 100,
      "remainingPrincipal": 0
    }
  ]
}
```

## License

MIT
