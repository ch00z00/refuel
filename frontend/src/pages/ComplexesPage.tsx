import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/molecules/Header';
import Footer from '../components/common/molecules/Footer';
import useInfiniteCircularScroll from '../hooks/useInfiniteCircularScroll';
import type { Complex } from '../types/complex';

const PageWrapper = styled.div`
  display: flex;
  padding: 5rem 0;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex-grow: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
  padding: 0 1rem; /* 上下のpaddingはScrollSnapWrapperで調整 */
`;

const PageTitle = styled.h1`
  font-size: 5vw;
  font-weight: 700;
  color: #1d1d1f;
`;

const ScrollSnapContainer = styled.div`
  width: 100%;
  max-width: 700px; /* コンテンツの最大幅、UsagiScrollの .c-wrap に近い */
  height: calc(100vh - 5rem - 5rem); /* Header/Footerを除いた高さ */
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    /* Chrome, Safari, Opera */
    display: none;
  }
`;

const ComplexScrollItem = styled.div`
  scroll-snap-align: start; /* 各アイテムの開始位置でスナップ */
  height: 100%; /* ScrollSnapContainerの高さ一杯に広がる */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* UsagiScrollの .c-inner のようなスタイルをここに適用 */
  /* border-top: 1px solid #111; */
`;

import { fetchComplexes } from '../services/api';

const ComplexesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const { scrollContainerRef, displayItems, currentVisibleIndex } =
    useInfiniteCircularScroll({
      items: complexes,
    });

  // TODO: Complex編集画面に実装する
  // 削除ミューテーション
  // const deleteMutation = useMutation<void, Error, number>({
  //   mutationFn: deleteComplex,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['complexes'] }); // キャッシュを無効化して再フェッチ
  //     alert(t('deleteConfirmation', { id: '' }).replace('{{id}} ', '')); // 実際には削除されたIDを渡す
  //   },
  //   onError: (err) => {
  //     alert(`削除に失敗しました: ${err.message}`);
  //   },
  // });

  const handleAddNewComplex = () => {
    console.log('新しいコンプレックスを登録');
    navigate('/complexes/new'); // 登録ページへ遷移
  };

  // TODO: Complex編集画面に実装する
  // const handleEditComplex = (id: number) => {
  //   console.log(`編集: Complex ID ${id}`);
  //   // TODO: React Routerを使用して編集ページへ遷移
  //   alert(t('editButton') + ` (ID: ${id}) 画面へ（未実装）`);
  // };

  // TODO: Complex編集画面に実装する
  // const handleDeleteComplex = (id: number) => {
  //   if (window.confirm(t('deleteConfirmation', { id }))) {
  //     deleteMutation.mutate(id);
  //   }
  // };

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
        {/* PageTitleWrapper はスクロールの外に配置するか、各アイテム内に含めるか検討 */}
        {/* <PageTitleWrapper> ... </PageTitleWrapper> */}
        {!isLoading && !error && complexes.length > 0 && (
          <ScrollSnapContainer>
            {/* {displayItems.map((complex, index) => ( */}
            {complexes.map(
              (
                complex,
                index // まずはcomplexesを直接使用
              ) => (
                <ComplexScrollItem key={`${complex.id}-${index}`}>
                  {/* ここに各コンプレックスの詳細を表示するコンポーネントを配置 */}
                  {/* 例: <ComplexCard complex={complex} isFocused={index === currentVisibleIndex} /> */}
                  <div>
                    <PageTitle>{complex.content}</PageTitle>
                    <p>Category: {complex.category}</p>
                  </div>
                </ComplexScrollItem>
              )
            )}
          </ScrollSnapContainer>
        )}
        {!isLoading && !error && complexes.length === 0 && (
          <PageTitle>{t('noComplexesFound')}</PageTitle>
        )}
      </MainContent>
      <Footer
        currentComplexNumber={currentVisibleIndex + 1}
        totalComplexes={complexes.length}
      />
    </PageWrapper>
  );
};

export default ComplexesPage;
