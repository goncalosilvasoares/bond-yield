import React from 'react';
import './CashFlowTable.scss';
import { t } from '../../i18n';
export type CashFlowEntry = {
  period: number;
  paymentDate: string;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export const CashFlowTable: React.FC<{ schedule: CashFlowEntry[] }> = ({ schedule }) => (
  <div className="cash-flow-table glass-card">
    <h3>{t('schedule.title')}</h3>
    <table>
      <thead>
        <tr>
          <th>{t('schedule.period')}</th>
          <th>{t('schedule.paymentDate')}</th>
          <th>{t('schedule.couponPayment')}</th>
          <th>{t('schedule.cumulativeInterest')}</th>
          <th>{t('schedule.remainingPrincipal')}</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((entry) => (
          <tr key={entry.period}>
            <td>{entry.period}</td>
            <td>{formatDate(entry.paymentDate)}</td>
            <td>{entry.couponPayment}</td>
            <td>{entry.cumulativeInterest}</td>
            <td>{entry.remainingPrincipal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
