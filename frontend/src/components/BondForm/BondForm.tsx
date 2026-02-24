import React, { useState } from 'react';
import './BondForm.scss';
import { t } from '../../i18n';
import { calculateBond } from '../../services/bondService';

export type BondFormValues = {
  faceValue: string;
  annualCouponRate: string;
  marketPrice: string;
  yearsToMaturity: string;
  couponFrequency: string;
};

export type BondFormProps = {
  onSuccess: (result: any) => void;
  onError?: (error: string) => void;
};

export const BondForm: React.FC<BondFormProps> = ({ onSuccess }) => {
  const [values, setValues] = useState<BondFormValues>({
    faceValue: '',
    annualCouponRate: '',
    marketPrice: '',
    yearsToMaturity: '',
    couponFrequency: '2',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!values.faceValue || !values.annualCouponRate || !values.marketPrice || !values.yearsToMaturity) {
      setError(t('form.error.requiredFields'));
      setLoading(false);
      return;
    }
    try {
      const data = await calculateBond({
        faceValue: Number(values.faceValue),
        annualCouponRate: Number(values.annualCouponRate),
        marketPrice: Number(values.marketPrice),
        yearsToMaturity: Number(values.yearsToMaturity),
        couponFrequency: Number(values.couponFrequency),
      });
      onSuccess(data);
    } catch (err: any) {
      let msg = err.message || 'Request failed';
      // If the error message matches a known translation, show it directly
      if (msg === t('form.error.invalidInput')) {
        setError(msg);
      } else {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('invalid') || lowerMsg.includes('required')) {
          msg = t('form.error.invalidInput');
        } else if (lowerMsg.includes('network') || lowerMsg.includes('failed to fetch')) {
          msg = t('form.error.network');
        } else {
          msg = t('form.error.generic');
        }
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bond-form" onSubmit={handleSubmit}>
      <label className="bond-field">
        <span>{t('form.faceValue')}</span>
  <input name="faceValue" type="number" value={values.faceValue} onChange={handleChange} min={1} />
      </label>
      <label className="bond-field">
        <span>{t('form.annualCouponRate')}</span>
  <input name="annualCouponRate" type="number" value={values.annualCouponRate} onChange={handleChange} min={0} step={1} />
      </label>
      <label className="bond-field">
        <span>{t('form.marketPrice')}</span>
  <input name="marketPrice" type="number" value={values.marketPrice} onChange={handleChange} min={1} />
      </label>
      <label className="bond-field">
        <span>{t('form.yearsToMaturity')}</span>
  <input name="yearsToMaturity" type="number" value={values.yearsToMaturity} onChange={handleChange} min={0} step={1} />
      </label>
      <label className="bond-field">
        <span>{t('form.couponFrequency')}</span>
  <select name="couponFrequency" value={values.couponFrequency} onChange={handleChange}>
          <option value="1">{t('form.couponFrequency.annual')}</option>
          <option value="2">{t('form.couponFrequency.semiannual')}</option>
        </select>
      </label>
      <button
        type="submit"
        className="gradient-button"
        disabled={loading}
      >
        <span className="btn-text">
          {loading ? t('form.calculating') : t('form.calculate')}
        </span>
        <span className="btn-hover">
          <span>{loading ? t('form.calculating') : t('form.calculate')}</span>
        </span>
      </button>
  {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </form>
  );
};
