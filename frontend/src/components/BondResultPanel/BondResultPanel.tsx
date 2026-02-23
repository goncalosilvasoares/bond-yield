import React from 'react';
import { BondResult, BondResultType } from '../BondResult/BondResult';
import { CashFlowTable, CashFlowEntry } from '../CashFlowTable/CashFlowTable';
import { t } from '../../i18n';

interface BondResultPanelProps {
  result: BondResultType & { cashFlowSchedule: CashFlowEntry[] };
  onRequestAgain: () => void;
}

export const BondResultPanel: React.FC<BondResultPanelProps> = ({ result, onRequestAgain }) => (
  <>
    <div className="results-wrap">
        <BondResult result={result} />
        <CashFlowTable schedule={result.cashFlowSchedule} />

        <button
            onClick={onRequestAgain}
            className="gradient-button"
          >
            <span className="btn-text">            {t("form.newCalculation")}
                </span>
                <span className="btn-hover">
                  <span>{t("form.newCalculation")}</span>
                </span>
              </button>
    </div>
  </>
);