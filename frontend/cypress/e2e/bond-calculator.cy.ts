  import translations from '../../src/i18n/en.json';


const t = (key: string) => (translations as any)[key] || key;


describe('Bond Yield Calculator E2E', () => {
  beforeEach(() => {
    cy.viewport(1200, 900);
    cy.visit('/');
  });

    afterEach(() => {
    cy.screenshot();
  });
  
  it('shows required fields error if form is empty', () => {
    cy.get('button[type="submit"]').click();
    cy.contains(t('form.error.requiredFields')).scrollIntoView().should('be.visible');
  });

  it('shows required fields error if only some fields are filled', () => {
    cy.get('input[name="faceValue"]').type('1000');
    cy.get('button[type="submit"]').click();
    cy.contains(t('form.error.requiredFields')).scrollIntoView().should('be.visible');
  });

  it('shows network error if backend is unreachable', () => {
    cy.intercept('POST', '**/bond/calculate', { forceNetworkError: true }).as('calculateBond');
    cy.get('input[name="faceValue"]').type('1000');
    cy.get('input[name="annualCouponRate"]').type('5');
    cy.get('input[name="marketPrice"]').type('980');
    cy.get('input[name="yearsToMaturity"]').type('2');
    cy.get('select[name="couponFrequency"]').select('2');
    cy.get('button[type="submit"]').click();
    cy.contains(t('form.error.network')).should('be.visible');
  });

  it('has accessible labels for all fields', () => {
    cy.get('label').contains(t('form.faceValue')).should('exist');
    cy.get('label').contains(t('form.annualCouponRate')).should('exist');
    cy.get('label').contains(t('form.marketPrice')).should('exist');
    cy.get('label').contains(t('form.yearsToMaturity')).should('exist');
    cy.get('label').contains(t('form.couponFrequency')).should('exist');
  });

  it('calculates bond yield and displays results (normal case)', () => {
    cy.get(`input[name="faceValue"]`).type('1000');
    cy.get(`input[name="annualCouponRate"]`).type('5');
    cy.get(`input[name="marketPrice"]`).type('980');
    cy.get(`input[name="yearsToMaturity"]`).type('2');
    cy.get('select[name="couponFrequency"]').select('2');
    cy.get('button[type="submit"]').click();

    cy.contains(t('results.title')).should('be.visible');
    cy.contains(t('results.currentYield')).should('be.visible');
    cy.contains(t('results.ytm')).should('be.visible');
    cy.contains(t('results.totalInterest')).should('be.visible');
    cy.contains(t('results.premiumOrDiscount')).should('be.visible');
    cy.contains(t('schedule.title')).should('be.visible');
    cy.get('table').should('exist');
  });

  it('handles zero coupon bond (edge case)', () => {
    cy.intercept('POST', '**/bond/calculate', {
      statusCode: 200,
      body: {
        currentYield: 0,
        ytm: 0.021,
        totalInterest: 0,
        premiumOrDiscount: 'Discount',
        cashFlowSchedule: []
      }
    }).as('calculateZeroCoupon');
    cy.get(`input[name="faceValue"]`).type('1000');
    cy.get(`input[name="annualCouponRate"]`).type('0');
    cy.get(`input[name="marketPrice"]`).type('900');
    cy.get(`input[name="yearsToMaturity"]`).type('5');
    cy.get('select[name="couponFrequency"]').select('1');
    cy.get('button[type="submit"]').click();
  cy.contains(t('results.title')).should('be.visible');
  cy.contains(t('results.currentYield')).parent().should('contain', '0%');
  });

  it('handles premium bond (edge case)', () => {
    cy.get(`input[name="faceValue"]`).type('1000');
    cy.get(`input[name="annualCouponRate"]`).type('5');
    cy.get(`input[name="marketPrice"]`).type('1100');
    cy.get(`input[name="yearsToMaturity"]`).type('3');
    cy.get('select[name="couponFrequency"]').select('1');
    cy.get('button[type="submit"]').click();
    cy.contains(t('results.premiumOrDiscount')).parent().should('contain', 'Premium');
  });

  it('can start a new calculation', () => {
    cy.get(`input[name="faceValue"]`).type('1000');
    cy.get(`input[name="annualCouponRate"]`).type('5');
    cy.get(`input[name="marketPrice"]`).type('980');
    cy.get(`input[name="yearsToMaturity"]`).type('2');
    cy.get('select[name="couponFrequency"]').select('2');
    cy.get('button[type="submit"]').click();
    cy.contains(t('form.newCalculation')).click();
    cy.get(`input[name="faceValue"]`).should('have.value', '');
  });
});
