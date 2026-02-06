import { Transaction } from ".";

const KEY = "msb:transactions";

export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(items: Transaction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}