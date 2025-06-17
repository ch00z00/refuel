import type { Complex, ComplexInput } from '../types/complex';

// 仮のユーザーID (認証基盤実装時に置き換える)
const DUMMY_USER_ID = 'test-user-uuid-12345';

const API_BASE_URL = '/api/v1';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'X-User-ID': DUMMY_USER_ID,
});

/* コンプレックス一覧取得 */
export const fetchComplexes = async (): Promise<Complex[]> => {
  // eslint-disable-next-line no-undef
  const response = await fetch(`${API_BASE_URL}/complexes`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch complexes');
  return response.json();
};

/* 新しいコンプレックスを登録 */
export const createComplex = async (data: ComplexInput): Promise<Complex> => {
  // eslint-disable-next-line no-undef
  const response = await fetch(`${API_BASE_URL}/complexes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create complex');
  return response.json();
};

// コンプレックス削除 (ComplexesPage.tsxで使用していたダミー関数を置き換え)
export const deleteComplex = async (id: number): Promise<void> => {
  // eslint-disable-next-line no-undef
  const response = await fetch(`${API_BASE_URL}/complexes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete complex');
};

// TODO: 他のAPI関数 (fetchComplex, updateComplex, fetchGoals, createGoalなど) もここに追加
