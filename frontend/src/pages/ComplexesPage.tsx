import React from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/molecules/Header';
import Footer from '../components/common/molecules/Footer';
import ComplexList from '../components/complexes/organisms/ComplexList';
import type { Complex } from '../types/complex';

const PageWrapper = styled.div`
  display: flex;
  padding-top: 8rem 0 5rem;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
`;

const PageTitleWrapper = styled.div`
  margin-bottom: 2.5rem;
  text-align: center;
`;

const PageTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: #58585b;
  max-width: 600px;
  margin: 0 auto;
`;

import { fetchComplexes, deleteComplex } from '../services/api';

const ComplexesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const navigate = useNavigate(); // useNavigateフックを取得

  // TanStack Query を使用してデータをフェッチ
  const {
    data: complexes = [],
    isLoading,
    error,
  } = useQuery<Complex[], Error>({
    queryKey: ['complexes'],
    queryFn: fetchComplexes, // ダミー関数から実際のAPI関数へ
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 削除ミューテーション
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deleteComplex,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] }); // キャッシュを無効化して再フェッチ
      alert(t('deleteConfirmation', { id: '' }).replace('{{id}} ', '')); // 実際には削除されたIDを渡す
    },
    onError: (err) => {
      alert(`削除に失敗しました: ${err.message}`);
    },
  });

  const handleAddNewComplex = () => {
    console.log('新しいコンプレックスを登録');
    navigate('/complexes/new'); // 登録ページへ遷移
  };

  const handleViewGoals = (id: number) => {
    console.log(`目標を見る/設定: Complex ID ${id}`);
    // TODO: React Routerを使用して目標設定ページへ遷移
    alert(t('viewSetGoalsButton') + ` (ID: ${id}) 画面へ（未実装）`);
  };

  const handleEditComplex = (id: number) => {
    console.log(`編集: Complex ID ${id}`);
    // TODO: React Routerを使用して編集ページへ遷移
    alert(t('editButton') + ` (ID: ${id}) 画面へ（未実装）`);
  };

  // 削除処理はComplexCardからComplexesPageに移譲
  const handleDeleteComplex = (id: number) => {
    if (window.confirm(t('deleteConfirmation', { id }))) {
      deleteMutation.mutate(id);
    }
  };

  // ローディングとエラー表示のデモ
  // TanStack QueryがisLoadingとerrorを管理するため、デモ用のstateは不要
  // const [showDummyData, setShowDummyData] = useState(false);
  // useEffect(() => { ... }, [isLoading, error, complexes]);

  if (
    isLoading
    // && !showDummyData
  )
    return (
      <PageWrapper>
        <MainContent>
          <PageTitle>{t('loading')}</PageTitle>
        </MainContent>
      </PageWrapper>
    ); // 初期ローディング
  if (error)
    return (
      <PageWrapper>
        <MainContent>
          <PageTitle>
            {t('errorPrefix')}
            {error.message}
          </PageTitle>
        </MainContent>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <Header onAddNewComplex={handleAddNewComplex} />
      <MainContent>
        <PageTitleWrapper>
          <PageTitle>{t('complexesPageTitle')}</PageTitle>
          <PageSubtitle>{t('complexesPageSubtitle')}</PageSubtitle>
        </PageTitleWrapper>
        {!isLoading && !error && (
          <ComplexList
            complexes={complexes}
            onViewGoals={handleViewGoals}
            onEdit={handleEditComplex}
            onDelete={handleDeleteComplex}
            onAddNewComplex={handleAddNewComplex}
          />
        )}
      </MainContent>
      <Footer totalComplexes={complexes.length} />
    </PageWrapper>
  );
};

export default ComplexesPage;
