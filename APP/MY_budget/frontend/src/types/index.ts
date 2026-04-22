export type UserProfile = {
  name: string;
  email?: string;
  age?: number;
};

export type TransactionInput = {
  label: string;
  amount: number;
  type: "income" | "expense";
  is_recurring?: boolean;
};

export type Transaction = TransactionInput & {
  id: string;
  createdAt: string;
};