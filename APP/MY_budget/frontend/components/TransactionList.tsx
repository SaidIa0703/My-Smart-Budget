"use client";

import { Transaction } from "../src/app/profile/index";

export default function TransactionList({
  items,
  onDelete,
  onClearAll,
}: {
  items: Transaction[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}) {
  if (!items.length) {
    return <p className="text-sm text-gray-500">Aucune transaction pour le moment.</p>;
  }

  const totalIncome = items.filter(i => i.type === "income").reduce((s, i) => s + i.amount, 0);
  const totalExpense = items.filter(i => i.type === "expense").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="mr-3">Revenus: {fmt(totalIncome)}</span>
          <span>Dépenses: {fmt(totalExpense)}</span>
        </div>
        <button onClick={onClearAll} className="text-sm text-red-600 hover:underline">Tout effacer</button>
      </div>

      <ul className="divide-y rounded-xl border bg-white">
        {items.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{t.label}</p>
              <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString("fr-FR")}</p>
            </div>
            <div className={`font-semibold ${t.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
              {t.type === "income" ? "+" : "-"} {fmt(t.amount)}
            </div>
            <button onClick={() => onDelete(t.id)} className="text-xs text-gray-500 hover:text-red-600">Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}