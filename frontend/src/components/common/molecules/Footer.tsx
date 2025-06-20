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

const CopyrightNotice = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
`;

const ComplexCount = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
`;

interface FooterProps {
  currentComplexNumber?: number;
  totalComplexes: number;
}

const Footer: React.FC<FooterProps> = ({
  currentComplexNumber,
  totalComplexes,
}) => {
  return (
    <FooterWrapper>
      <FooterContentContainer>
        <CopyrightNotice>
          © 2025 Yusuke Seki
          <br />
          All Rights Reserved
        </CopyrightNotice>
        {totalComplexes > 0 &&
          currentComplexNumber &&
          currentComplexNumber > 0 && (
            <ComplexCount>
              {currentComplexNumber} / {totalComplexes}
            </ComplexCount>
          )}
      </FooterContentContainer>
    </FooterWrapper>
  );
};

export default Footer;
