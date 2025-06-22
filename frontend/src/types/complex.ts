export interface Complex {
  id: number;
  user_id: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  goals: Goal[];
}

export interface ComplexInput {
  content: string;
  category: string;
}

export interface Goal {
  id: number;
  complex_id: number;
  surface_goal: string;
  underlying_goal: string;
  created_at: string;
  updated_at: string;
}

export interface ActionInput {
  content: string;
  completed_at?: string;
  category: string;
  created_at: string;
  updated_at: string;
}
