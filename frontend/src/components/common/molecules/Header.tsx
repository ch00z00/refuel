import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from '../atoms/Button';
// import { useNavigate } from 'react-router-dom';

const HeaderWrapper = styled.header`
  background-color: transparent;
  position: fixed;
  top: 1rem;
  left: 1rem;
  border-radius: 2rem;
  z-index: 1000;
  width: calc(100% - 2rem);
`;

const NavContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
`;

const Logo = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1d1d1f;
`;

const LanguageSwitcher = styled.div`
  margin-left: 1rem;
  display: flex;
  gap: 0.5rem;
`;

interface HeaderProps {
  onAddNewComplex: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNewComplex }) => {
  // const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <HeaderWrapper>
      <NavContainer>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Logo>{t('headerTitle')}</Logo>
          <LanguageSwitcher>
            <Button
              size="small"
              variant={i18n.resolvedLanguage === 'ja' ? 'primary' : 'ghost'}
              onClick={() => changeLanguage('ja')}
              disabled={i18n.resolvedLanguage === 'ja'}
            >
              JA
            </Button>
            <Button
              size="small"
              variant={i18n.resolvedLanguage === 'en' ? 'primary' : 'ghost'}
              onClick={() => changeLanguage('en')}
              disabled={i18n.resolvedLanguage === 'en'}
            >
              EN
            </Button>
          </LanguageSwitcher>
        </div>
        <Button variant="primary" size="medium" onClick={onAddNewComplex}>
          + {t('addNewComplexButton')}
        </Button>
      </NavContainer>
    </HeaderWrapper>
  );
};

export default Header;
