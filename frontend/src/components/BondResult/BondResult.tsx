import React from 'react';
import './BondResult.scss';
import { t } from '../../i18n';
export type BondResultType = {
  currentYield: number;
  ytm: number;
  totalInterest: number;
  premiumOrDiscount: string;
};


function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export const BondResult: React.FC<{ result: BondResultType }> = ({ result }) => (
  <div className="bond-result glass-card">
    <h2>{t('results.title')}</h2>
    <ul>
      <li>
        <span>{t("results.currentYield")}</span>
        <strong>{result.currentYield}%</strong>
      </li>
      <li>
        <span>{t("results.ytm")}</span>
        <strong>{result.ytm}%</strong>
      </li>
      <li>
        <span>{t("results.totalInterest")}</span>
        <strong>{result.totalInterest}</strong>
      </li>
      <li>
        <span>{t("results.premiumOrDiscount")}</span>
        <strong>{toTitleCase(result.premiumOrDiscount)}</strong>
      </li>
    </ul>
  </div>
);
