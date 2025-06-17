import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { Complex } from '../../../types/complex';
import Button from '../../common/atoms/Button';

const CardWrapper = styled.div<{ delay: number }>`
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem; /* 24px */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 0.3s ease-out,
    box-shadow 0.3s ease-out;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: ${({ delay }) => delay}s;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CategoryBadge = styled.span`
  display: inline-block;
  background-color: #e0e7ff; /* Indigo-100 like */
  color: #4338ca; /* Indigo-700 like */
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  padding: 0.25rem 0.75rem; /* 4px 12px */
  border-radius: 9999px; /* pill shape */
  margin-bottom: 0.75rem; /* 12px */
`;

const ContentText = styled.p`
  color: #4b5563; /* Gray-600 like */
  font-size: 0.9375rem; /* 15px */
  line-height: 1.6;
  margin-bottom: 1rem; /* 16px */
  /* For line clamping */
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: calc(1.6em * 4); /* Ensure space for 4 lines */
`;

const MetaText = styled.p`
  font-size: 0.75rem; /* 12px */
  color: #6b7280; /* Gray-500 like */
  margin-bottom: 1rem; /* 16px */
`;

const ActionsWrapper = styled.div`
  display: flex;
  gap: 0.5rem; /* 8px */
  margin-top: auto; /* Pushes actions to the bottom */
`;

interface ComplexCardProps {
  complex: Complex;
  onViewGoals: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  animationDelay: number;
}

const ComplexCard: React.FC<ComplexCardProps> = ({
  complex,
  onViewGoals,
  onEdit,
  onDelete,
  animationDelay,
}) => {
  const { t } = useTranslation();
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };

  return (
    <CardWrapper delay={animationDelay}>
      <div>
        <CategoryBadge>{complex.category}</CategoryBadge>
        <ContentText>{complex.content}</ContentText>
      </div>
      <div>
        <MetaText>
          {t('lastUpdated')}
          {formatDate(complex.updated_at)}
        </MetaText>
        <ActionsWrapper>
          <Button
            variant="primary"
            size="small"
            onClick={() => onViewGoals(complex.id)}
            style={{ flexGrow: 1 }}
          >
            {t('viewSetGoalsButton')}
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onEdit(complex.id)}
          >
            {t('editButton')}
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => onDelete(complex.id)}
          >
            {t('deleteButton')}
          </Button>
        </ActionsWrapper>
      </div>
    </CardWrapper>
  );
};

export default ComplexCard;
