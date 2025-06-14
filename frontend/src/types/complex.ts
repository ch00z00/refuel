export interface Complex {
  id: number;
  user_id: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ComplexInput {
  content: string;
  category: string;
}
