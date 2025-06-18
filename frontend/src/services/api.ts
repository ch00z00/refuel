import type { Complex, ComplexInput } from '../types/complex';

const DUMMY_USER_ID = 'user-test-123';
const API_BASE_URL = '/api/v1';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'X-User-ID': DUMMY_USER_ID,
});

/* Get all complexes */
export const fetchComplexes = async (): Promise<Complex[]> => {
  const response = await fetch(`${API_BASE_URL}/complexes`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch complexes');
  return response.json();
};

/* Create new complex */
export const createComplex = async (data: ComplexInput): Promise<Complex> => {
  const response = await fetch(`${API_BASE_URL}/complexes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorDetails = '';
    try {
      const responseText = await response.text();
      if (responseText) {
        try {
          const jsonData = JSON.parse(responseText);
          errorDetails = `: ${JSON.stringify(jsonData)}`;
        } catch (jsonError) {
          errorDetails = `: ${responseText}`;
        }
      }
    } catch (readError) {
      errorDetails = ': Failed to read error response body';
    }
    throw new Error(
      `Failed to create complex (status: ${response.status})${errorDetails}`
    );
  }
  return response.json();
};

/* Delete complex */
export const deleteComplex = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/complexes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete complex');
};

/*
 * TODO: 他のAPI関数もここに追加
 * - fetchComplex
 * - updateComplex
 * - fetchGoals
 * - createGoal
 */
