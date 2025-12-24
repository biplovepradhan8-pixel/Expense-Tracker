
export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD format
  hour: number; // 0-23
  amount: number;
  description: string;
  notes: string;
}

export interface User {
  username: string;
  password?: string; // Should not be stored long-term in a real app
  expenses: Expense[];
  balance: number;
}
