import React from 'react';
import './Header.scss';
import logo from '../../assets/genesis-logo.svg';
import { t } from '../../i18n';

export const Header: React.FC = () => (
    <header className="header">
        <img src={logo} alt="Genesis Logo" className="header-logo" />

        <div className="header-center">
            {t('header.title')}
        </div>
    </header>
);
