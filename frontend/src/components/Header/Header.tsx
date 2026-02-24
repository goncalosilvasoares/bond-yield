import React from 'react';
import './Header.scss';

import { t } from '../../i18n';

export const Header: React.FC = () => (

    <header className="header">
        <div className="header-center">
            {t('header.title')}
        </div>
    </header>
);
