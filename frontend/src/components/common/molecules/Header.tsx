import React from 'react';
import styled from 'styled-components';
import Button from '../atoms/Button';

const HeaderWrapper = styled.header`
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem; /* 16px */
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem; /* 64px */
`;

const Logo = styled.h1`
  font-size: 1.75rem; /* 28px */
  font-weight: 600;
  color: #1d1d1f;
`;

interface HeaderProps {
  onAddNewComplex: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNewComplex }) => {
  return (
    <HeaderWrapper>
      <NavContainer>
        <Logo>Re:Fuel</Logo>
        <Button variant="primary" size="small" onClick={onAddNewComplex}>
          新しいコンプレックスを登録
        </Button>
      </NavContainer>
    </HeaderWrapper>
  );
};

export default Header;
