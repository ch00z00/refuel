import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Button from '../../common/atoms/Button';

const MessageWrapper = styled.div`
  margin-top: 3rem; /* 48px */
  text-align: center;
  padding: 2rem;
`;

const IconWrapper = styled.div`
  svg {
    margin: 0 auto;
    height: 3rem; /* 48px */
    width: 3rem; /* 48px */
    color: #9ca3af; /* Gray-400 like */
  }
`;

const Title = styled.h3`
  margin-top: 0.5rem; /* 8px */
  font-size: 1.25rem; /* 20px */
  font-weight: 500;
  color: #111827; /* Gray-900 like */
`;

const Subtitle = styled.p`
  margin-top: 0.25rem; /* 4px */
  font-size: 0.9375rem; /* 15px */
  color: #6b7280; /* Gray-500 like */
`;

const ButtonWrapper = styled.div`
  margin-top: 1.5rem; /* 24px */
`;

interface NoComplexesMessageProps {
  onAddNewComplex: () => void;
}

const NoComplexesMessage: React.FC<NoComplexesMessageProps> = ({
  onAddNewComplex,
}) => {
  const { t } = useTranslation();
  return (
    <MessageWrapper>
      <IconWrapper>
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
      </IconWrapper>
      <Title>{t('noComplexesTitle')}</Title>
      <Subtitle>{t('noComplexesSubtitle')}</Subtitle>
      <ButtonWrapper>
        <Button variant="primary" onClick={onAddNewComplex}>
          {t('registerComplexButton')}
        </Button>
      </ButtonWrapper>
    </MessageWrapper>
  );
};

export default NoComplexesMessage;
