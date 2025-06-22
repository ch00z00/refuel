import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { fetchComplex } from '../services/api';
import type { Complex, Goal } from '../types/complex';
import Header from '../components/common/molecules/Header';
import Button from '../components/common/atoms/Button';

const PageWrapper = styled.div`
  padding: 8rem 2rem 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const ComplexHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ComplexContent = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
`;

const ComplexCategory = styled.p`
  font-size: 1rem;
  color: #58585b;
  background-color: #f5f5f7;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
`;

const GoalsSection = styled.section`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 1.5rem;
`;

const GoalCard = styled.div`
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const GoalTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const GoalContent = styled.p`
  font-size: 1.25rem;
  color: #1d1d1f;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ActionsButton = styled(Button)`
  margin-top: 1rem;
`;

const LoadingOrErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  font-size: 1.5rem;
`;

const ComplexDetailPage: React.FC = () => {
  const { complexId } = useParams<{ complexId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    data: complex,
    isLoading,
    error,
  } = useQuery<Complex, Error>({
    queryKey: ['complex', complexId],
    queryFn: () => {
      if (!complexId) {
        throw new Error('Complex ID is missing');
      }
      return fetchComplex(complexId);
    },
    enabled: !!complexId, // Only run query if complexId is available
  });

  if (isLoading) {
    return <LoadingOrErrorWrapper>{t('loading')}</LoadingOrErrorWrapper>;
  }

  if (error || !complex) {
    return (
      <LoadingOrErrorWrapper>
        {error ? `${t('errorPrefix')}${error.message}` : t('complexNotFound')}
      </LoadingOrErrorWrapper>
    );
  }

  return (
    <>
      <Header onAddNewComplex={() => navigate('/complexes/new')} />
      <PageWrapper>
        <ComplexHeader>
          <ComplexContent>{complex.content}</ComplexContent>
          <ComplexCategory>{complex.category}</ComplexCategory>
        </ComplexHeader>

        <Button
          variant="secondary"
          onClick={() => navigate(`/complexes/${complex.id}/edit`)}
        >
          {t('editComplexAndGoals')}
        </Button>

        <GoalsSection>
          <SectionTitle>{t('relatedGoals')}</SectionTitle>
          {complex.goals && complex.goals.length > 0 ? (
            complex.goals.map((goal: Goal) => (
              <GoalCard key={goal.id}>
                <GoalTitle>{t('surfaceGoal')}</GoalTitle>
                <GoalContent>{goal.content}</GoalContent>
                <ActionsButton
                  onClick={() => navigate(`/goals/${goal.id}/actions`)}
                >
                  {t('trackActions')}
                </ActionsButton>
              </GoalCard>
            ))
          ) : (
            <p>{t('noGoalsSet')}</p>
          )}
        </GoalsSection>

        <Button onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
          {t('backToList')}
        </Button>
      </PageWrapper>
    </>
  );
};

export default ComplexDetailPage;
