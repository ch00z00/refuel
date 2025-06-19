import React from 'react';
import styled from 'styled-components';

const FooterWrapper = styled.footer`
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 1000;
  width: calc(100% - 2rem);
`;

const FooterContentContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3rem;
`;

const AuthorName = styled.p`
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
`;

const ComplexCount = styled.p`
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
`;

interface FooterProps {
  totalComplexes: number;
}

const Footer: React.FC<FooterProps> = ({ totalComplexes }) => {
  return (
    <FooterWrapper>
      <FooterContentContainer>
        <AuthorName>Yusuke Seki</AuthorName>
        {totalComplexes > 0 && <ComplexCount>{totalComplexes}</ComplexCount>}
      </FooterContentContainer>
    </FooterWrapper>
  );
};

export default Footer;
