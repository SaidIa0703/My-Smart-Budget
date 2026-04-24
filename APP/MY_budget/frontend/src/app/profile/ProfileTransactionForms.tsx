'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const getToken = () => sessionStorage.getItem('token') || localStorage.getItem('token') || '';

interface Category { value: string; label: string }
interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number | string;
  date: string;
  is_recurring?: boolean;
}

// ─── Formulaire d'ajout isolé ─────────────────────────────────────────────────
// Inputs NON-CONTRÔLÉS (name + FormData) → aucun state parent mis à jour pendant la frappe
export function ProfileAddForm({
  categories,
  onAdded,
  onClose,
}: {
  categories: Category[];
  onAdded: () => void;
  onClose: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const payload = {
      name: data.get('name') as string,
      category: data.get('category') as string,
      amount: parseFloat(data.get('amount') as string),
      date: data.get('date') as string,
      is_recurring: data.get('is_recurring') === 'on',
    };

    try {
      const res = await fetch(`${API_URL}/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        formRef.current?.reset();
        onAdded();
      } else {
        setError("Erreur lors de l'ajout.");
      }
    } catch {
      setError('Erreur serveur.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ajouter une Transaction</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
      </div>
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-700">{error}</div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Description"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          required
        />
        <select
          name="category"
          defaultValue=""
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
          required
        >
          <option value="" disabled>Catégorie</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input
            name="amount"
            type="number"
            placeholder="Montant (€)"
            step="0.01"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            required
          />
          <input
            name="date"
            type="date"
            defaultValue={today}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            required
          />
        </div>
        <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition">
          <input name="is_recurring" type="checkbox" className="w-5 h-5 accent-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">🔄 Prélèvement récurrent (mensuel)</span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={20} /> {loading ? 'Ajout…' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
}

// ─── Modale d'édition isolée ─────────────────────────────────────────────────
// Inputs NON-CONTRÔLÉS (defaultValue + ref) → React ne touche plus au DOM après le montage
export function ProfileEditModal({
  transaction,
  categories,
  onSaved,
  onClose,
}: {
  transaction: Transaction;
  categories: Category[];
  onSaved: () => void;
  onClose: () => void;
}) {
  const nameRef      = useRef<HTMLInputElement>(null);
  const amountRef    = useRef<HTMLInputElement>(null);
  const dateRef      = useRef<HTMLInputElement>(null);
  const categoryRef  = useRef<HTMLSelectElement>(null);
  const recurringRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { nameRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name      = nameRef.current?.value.trim() ?? '';
    const amount    = amountRef.current?.value ?? '';
    const date      = dateRef.current?.value ?? '';
    const category  = categoryRef.current?.value ?? '';
    const isRecurring = recurringRef.current?.checked ?? false;

    if (!name || !category || !amount) { setError('Tous les champs sont requis.'); return; }
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) { setError('Montant invalide.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, category, amount: parsed, date, is_recurring: isRecurring }),
      });
      if (res.ok) {
        onSaved();
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.message || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      setError('Erreur serveur.');
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Modifier la transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={22} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <input
            ref={nameRef}
            type="text"
            defaultValue={transaction.name}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            required
          />
          <select
            ref={categoryRef}
            defaultValue={transaction.category}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            required
          >
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              ref={amountRef}
              type="number"
              step="0.01"
              defaultValue={Number(transaction.amount)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            />
            <input
              ref={dateRef}
              type="date"
              defaultValue={String(transaction.date).split('T')[0]}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            />
          </div>
          <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition">
            <input
              ref={recurringRef}
              type="checkbox"
              defaultChecked={transaction.is_recurring ?? false}
              className="w-5 h-5 accent-indigo-600"
            />
            <span className="text-sm font-medium text-indigo-700">🔄 Prélèvement récurrent (mensuel)</span>
          </label>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check size={16} /> {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
