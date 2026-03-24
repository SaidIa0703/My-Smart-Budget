
import React, { useState } from "react";
import { TransactionInput } from "@/src/app/profile";

export default function TransactionForm({ onAdd }: Readonly<{ onAdd: (t: TransactionInput) => void }>) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount.replace(",", "."));
    if (!label.trim() || !Number.isFinite(parsed)) return;
    onAdd({ label: label.trim(), amount: Math.round(parsed * 100) / 100, type });
    setLabel("");
    setAmount("");
    setType("expense");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="label" className="text-sm text-gray-600">Intitulé</label>
        <input
          id="label"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring"
          placeholder="Courses, Salaire, Loyer…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="amount" className="text-sm text-gray-600">Montant (€)</label>
          <input
            id="amount"
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="type" className="text-sm text-gray-600">Type</label>
          <select id="type" className="w-full rounded-md border px-3 py-2" value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}>
            <option value="expense">Dépense</option>
            <option value="income">Revenu</option>
          </select>
        </div>
      </div>

      <button type="submit" className="rounded-xl bg-black px-4 py-2 text-white shadow active:scale-[0.99]">
        Ajouter
      </button>
    </form>
  );
}