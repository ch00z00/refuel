import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../components/common/molecules/Header';
// import Footer from '../components/footer/Footer';
import ComplexList from '../components/complexes/organisms/ComplexList';
import type { Complex } from '../types/complex';
// import { fetchComplexes, deleteComplex } from '../services/api'; // APIサービスを想定

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem; /* 32px 16px */
  width: 100%;
`;

const PageTitleWrapper = styled.div`
  margin-bottom: 2.5rem; /* 40px */
  text-align: center;
`;

const PageTitle = styled.h2`
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 0.5rem; /* 8px */
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem; /* 18px */
  color: #58585b; /* Apple風のサブテキストカラー */
  max-width: 600px;
  margin: 0 auto;
`;

// --- ダミーデータとダミーAPI関数 ---
const dummyComplexesData: Complex[] = [
  {
    id: 1,
    user_id: 'user-test-123',
    content:
      '人前で話すのが極度に苦手で、声が震えてしまう。特に大人数の前だと頭が真っ白になる。',
    category: 'コミュニケーション',
    created_at: '2023-10-27T10:00:00Z',
    updated_at: '2023-10-26T10:00:00Z',
  },
  {
    id: 2,
    user_id: 'user-test-123',
    content:
      '計画を立てても三日坊主で終わってしまう。継続力がない自分に嫌気がさす。',
    category: '自己管理',
    created_at: '2023-10-26T14:30:00Z',
    updated_at: '2023-10-25T14:30:00Z',
  },
  {
    id: 3,
    user_id: 'user-test-123',
    content: '他人の評価を気にしすぎて、自分の意見をなかなか言い出せない。',
    category: '対人関係',
    created_at: '2023-10-25T09:15:00Z',
    updated_at: '2023-10-24T09:15:00Z',
  },
];

// ダミーのAPIフェッチ関数 (TanStack Query用)
const fetchComplexes = async (): Promise<Complex[]> => {
  console.log('Fetching complexes...');
  // APIエンドポイント: GET /api/v1/complexes
  // const response = await fetch('/api/v1/complexes', { headers: {'X-User-ID': 'test-user-uuid-12345'} });
  // if (!response.ok) throw new Error('Network response was not ok');
  // return response.json();
  return new Promise((resolve) =>
    // eslint-disable-next-line no-undef
    setTimeout(() => resolve(dummyComplexesData), 1000)
  );
};

// ダミーの削除API関数
const deleteComplexAPI = async (id: number): Promise<void> => {
  console.log(`Deleting complex with id: ${id}`);
  // APIエンドポイント: DELETE /api/v1/complexes/${id}
  // const response = await fetch(`/api/v1/complexes/${id}`, { method: 'DELETE', headers: {'X-User-ID': 'test-user-uuid-12345'} });
  // if (!response.ok) throw new Error('Failed to delete complex');
  return new Promise((resolve) =>
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      const index = dummyComplexesData.findIndex((c) => c.id === id);
      if (index > -1) dummyComplexesData.splice(index, 1);
      resolve();
    }, 500)
  );
};
// --- ここまでダミー ---

const ComplexesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // TanStack Query を使用してデータをフェッチ
  const {
    data: complexes = [],
    isLoading,
    error,
  } = useQuery<Complex[], Error>({
    queryKey: ['complexes'],
    queryFn: fetchComplexes,
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // 削除ミューテーション
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deleteComplexAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] }); // キャッシュを無効化して再フェッチ
      // eslint-disable-next-line no-undef
      alert('コンプレックスを削除しました（ダミー）');
    },
    onError: (err) => {
      // eslint-disable-next-line no-undef
      alert(`削除に失敗しました: ${err.message}`);
    },
  });

  const handleAddNewComplex = () => {
    console.log('新しいコンプレックスを登録');
    // TODO: React Routerを使用して登録ページへ遷移
    // eslint-disable-next-line no-undef
    alert('コンプレックス登録画面へ（未実装）');
  };

  const handleViewGoals = (id: number) => {
    console.log(`目標を見る/設定: Complex ID ${id}`);
    // TODO: React Routerを使用して目標設定ページへ遷移
    // eslint-disable-next-line no-undef
    alert(`コンプレックスID ${id} の目標設定画面へ（未実装）`);
  };

  const handleEditComplex = (id: number) => {
    console.log(`編集: Complex ID ${id}`);
    // TODO: React Routerを使用して編集ページへ遷移
    // eslint-disable-next-line no-undef
    alert(`コンプレックスID ${id} の編集画面へ（未実装）`);
  };

  const handleDeleteComplex = (id: number) => {
    if (window.confirm(`コンプレックスID ${id} を本当に削除しますか？`)) {
      deleteMutation.mutate(id);
    }
  };

  // ローディングとエラー表示のデモ
  const [showDummyData, setShowDummyData] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line no-undef
    const timer = setTimeout(() => {
      setShowDummyData(true);
      // 0件表示のテストのため、初期は空配列を渡す
      if (complexes.length === 0 && !isLoading && !error) {
        // このデモでは、TanStack Queryがダミーデータをフェッチするので、
        // 0件表示はComplexListコンポーネントの初期状態に依存します。
        // 実際のAPI連携では、isLoadingとerrorの状態を見て適切に処理します。
      }
    }, 2000); // 2秒後にダミーデータを表示する（実際はTanStack Queryが管理）
    // eslint-disable-next-line no-undef
    return () => clearTimeout(timer);
  }, [isLoading, error, complexes]);

  if (isLoading && !showDummyData)
    return (
      <PageWrapper>
        <MainContent>
          <PageTitle>読み込み中...</PageTitle>
        </MainContent>
      </PageWrapper>
    ); // 初期ローディング
  if (error)
    return (
      <PageWrapper>
        <MainContent>
          <PageTitle>エラー: {error.message}</PageTitle>
        </MainContent>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <Header onAddNewComplex={handleAddNewComplex} />
      <MainContent>
        <PageTitleWrapper>
          <PageTitle>あなたのコンプレックス</PageTitle>
          <PageSubtitle>
            ここでは、あなたが登録したコンプレックスを確認し、それらを成長の糧に変えるための第一歩を踏み出せます。
          </PageSubtitle>
        </PageTitleWrapper>
        <ComplexList
          complexes={showDummyData ? complexes : []} // デモ用: TanStack Queryがデータを管理
          onViewGoals={handleViewGoals}
          onEdit={handleEditComplex}
          onDelete={handleDeleteComplex}
          onAddNewComplex={handleAddNewComplex}
        />
      </MainContent>
      {/* <Footer /> */} {/* フッターは必要に応じて追加 */}
    </PageWrapper>
  );
};

export default ComplexesPage;
