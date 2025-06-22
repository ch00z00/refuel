export interface Complex {
  id: number;
  user_id: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  goals?: Goal[];
}

export interface ComplexInput {
  content: string;
  category: string;
}

export interface Goal {
  id: number;
  complex_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: number;
  goal_id: number;
  content: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  gains?: GainItem[];
  losses?: LossItem[];
}

export interface GainItem {
  id: number;
  action_id: number;
  type: 'quantitative' | 'qualitative';
  description: string;
}

export interface LossItem {
  id: number;
  action_id: number;
  type: 'quantitative' | 'qualitative';
  description: string;
}

export interface ActionInput {
  goal_id: number;
  content: string;
  completed_at?: string;
  gains?: GainItemInput[];
  losses?: LossItemInput[];
}

export interface GainItemInput {
  type: 'quantitative' | 'qualitative';
  description: string;
}

export interface LossItemInput {
  type: 'quantitative' | 'qualitative';
  description: string;
}
