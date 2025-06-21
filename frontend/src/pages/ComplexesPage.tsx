import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/molecules/Header';
import Footer from '../components/common/molecules/Footer';
import useInfiniteCircularScroll from '../hooks/useInfiniteCircularScroll'; // 作成したフックをインポート
import ComplexDisplayCard from '../components/complexes/molecules/ComplexDisplayCard'; // 新しいカードコンポーネントをインポート
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
`;

const PageTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 700;
  color: #1d1d1f;
`;

const ScrollSnapContainer = styled.div`
  width: 100%;
  height: calc(100vh - 5rem - 5rem);
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    /* Chrome, Safari, Opera */
    display: none;
  }
`;

const ComplexScrollItem = styled.div`
  scroll-snap-align: start;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

import { fetchComplexes } from '../services/api';

const ComplexesPage: React.FC = () => {
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

  /* const scrollContainerRef = useRef<HTMLDivElement>(null);
  // displayItemsは循環スクロールのために元のcomplexesを加工したもの
  const [displayItems, setDisplayItems] = useState<Complex[]>([]);
  // 実際に表示されているcomplexesの元配列における0-indexedのインデックス
  const [actualCurrentIndex, setActualCurrentIndex] = useState(0);

  // 無限循環のためのデータ準備と初期スクロール位置設定
  useEffect(() => {
    if (complexes.length > 0) {
      let itemsForDisplay: Complex[] = [];
      let initialScrollIndex = 0;

      if (complexes.length === 1) {
        // アイテムが1つの場合、中央に配置するために3つ複製
        itemsForDisplay = [complexes[0], complexes[0], complexes[0]];
        initialScrollIndex = 1; // 中央のアイテム
      } else if (complexes.length > 1) {
        // 循環のため、最初と最後にダミー要素を追加
        // [lastItem, item1, item2, ..., lastItem, firstItem]
        itemsForDisplay = [
          complexes[complexes.length - 1], // 前のダミー（実際の最後のアイテム）
          ...complexes, // 実際のアイテム群
          complexes[0], // 後ろのダミー（実際の最初のアイテム）
        ];
        initialScrollIndex = 1; // 実際の最初のアイテム
      }
      setDisplayItems(itemsForDisplay);
      setActualCurrentIndex(0); // 初期表示はcomplexesの0番目

      // 初期スクロール位置を設定
      // DOMが更新された後に実行するためにsetTimeoutを使用
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const itemHeight = scrollContainerRef.current.clientHeight;
          scrollContainerRef.current.scrollTop =
            itemHeight * initialScrollIndex;
        }
      }, 0);
    } else {
      setDisplayItems([]);
      setActualCurrentIndex(0);
    }
  }, [complexes]); */

  const {
    scrollContainerRef,
    displayItems,
    actualCurrentIndex,
    scrollProgress,
  } = useInfiniteCircularScroll({ items: complexes, loopAround: true });

  // TODO: Complex編集画面に実装する
  const handleViewDetails = (id: number) => {
    navigate(`/complexes/${id}`);
  };

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
        {!isLoading && !error && displayItems.length > 0 ? (
          <ScrollSnapContainer
            ref={scrollContainerRef} /* onScrollはフック内で処理 */
          >
            {displayItems.map((complex, index) => (
              <ComplexScrollItem key={`${complex.id}-display-${index}`}>
                <ComplexDisplayCard
                  complex={complex}
                  scrollProgress={scrollProgress}
                  onViewDetails={handleViewDetails}
                />
              </ComplexScrollItem>
            ))}
          </ScrollSnapContainer>
        ) : null}
        {!isLoading && !error && complexes.length === 0 && (
          <PageTitle>{t('noComplexesFound')}</PageTitle>
        )}
      </MainContent>
      <Footer
        currentComplexNumber={complexes.length > 0 ? actualCurrentIndex + 1 : 0}
        totalComplexes={complexes.length > 0 ? complexes.length : 0}
      />
    </PageWrapper>
  );
};

export default ComplexesPage;
