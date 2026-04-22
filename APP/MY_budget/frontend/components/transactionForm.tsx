
import React, { useState } from "react";
import { TransactionInput } from "@/src/app/profile";

export default function TransactionForm({ onAdd }: Readonly<{ onAdd: (t: TransactionInput) => void }>) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isRecurring, setIsRecurring] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount.replace(",", "."));
    if (!label.trim() || !Number.isFinite(parsed)) return;
    onAdd({ label: label.trim(), amount: Math.round(parsed * 100) / 100, type, is_recurring: isRecurring });
    setLabel("");
    setAmount("");
    setType("expense");
    setIsRecurring(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="tf-label" className="text-sm text-gray-600">Intitulé</label>
        <input
          id="tf-label"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring bg-white text-gray-900"
          placeholder="Courses, Salaire, Loyer…"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="tf-amount" className="text-sm text-gray-600">Montant (€)</label>
          <input
            id="tf-amount"
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring bg-white text-gray-900"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="tf-type" className="text-sm text-gray-600">Type</label>
          <select
            id="tf-type"
            className="w-full rounded-md border px-3 py-2 bg-white text-gray-900"
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
          >
            <option value="expense">Dépense</option>
            <option value="income">Revenu</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 accent-indigo-600"
        />
        <span className="text-sm text-gray-600">🔄 Prélèvement récurrent (mensuel)</span>
      </label>

      <button type="submit" className="rounded-xl bg-black px-4 py-2 text-white shadow active:scale-[0.99]">
        Ajouter
      </button>
    </form>
  );
}
