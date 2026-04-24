'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Trash2, Plus, X, Download, Pencil, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const CATEGORIES = [
  'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Abonnements',
  'Restauration', 'Vêtements', 'Éducation', 'Logement', 'Revenus',
  'Prélèvement', 'Épargne', 'Autre',
];

interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  updated_at: string;
}

const getToken = () =>
  sessionStorage.getItem('token') || localStorage.getItem('token') || '';

const exportCSV = (transactions: Transaction[]) => {
  const header = 'Description,Catégorie,Montant (€),Date,Récurrent,Modifié le';
  const rows = transactions.map(t =>
    [
      `"${t.name}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      new Date(t.date).toLocaleDateString('fr-FR'),
      t.is_recurring ? 'Oui' : 'Non',
      t.updated_at ? new Date(t.updated_at).toLocaleDateString('fr-FR') : '',
    ].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Modale d'édition ────────────────────────────────────────────────────────
// Inputs NON-CONTRÔLÉS (defaultValue + ref) → React ne touche plus au DOM
// après le montage → aucune perte de focus possible.
function EditModal({
  transaction,
  onSave,
  onClose,
}: {
  transaction: Transaction;
  onSave: (id: number, data: Omit<Transaction, 'id' | 'updated_at'>) => Promise<string | null>;
  onClose: () => void;
}) {
  const nameRef     = useRef<HTMLInputElement>(null);
  const amountRef   = useRef<HTMLInputElement>(null);
  const dateRef     = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const recurringRef = useRef<HTMLInputElement>(null);

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Focus automatique à l'ouverture
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    const name     = nameRef.current?.value.trim() ?? '';
    const amount   = amountRef.current?.value ?? '';
    const date     = dateRef.current?.value ?? '';
    const category = categoryRef.current?.value ?? '';
    const isRecurring = recurringRef.current?.checked ?? false;

    if (!name || !category || !amount) {
      setError('Tous les champs sont requis.');
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) {
      setError('Montant invalide.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await onSave(transaction.id, {
      name,
      category,
      amount: parsed,
      date,
      is_recurring: isRecurring,
    });
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Modifier la transaction</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Champs — defaultValue : React ne gère plus la valeur après le montage */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              ref={nameRef}
              type="text"
              defaultValue={transaction.name}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant (€)</label>
              <input
                ref={amountRef}
                type="number"
                step="0.01"
                defaultValue={transaction.amount}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                ref={dateRef}
                type="date"
                defaultValue={transaction.date.split('T')[0]}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
            <select
              ref={categoryRef}
              defaultValue={transaction.category}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              ref={recurringRef}
              type="checkbox"
              defaultChecked={transaction.is_recurring}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-sm text-slate-600">🔄 Prélèvement récurrent (mensuel)</span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Check size={16} />
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire d'ajout (state local = pas de re-render parent pendant la frappe)
function AddForm({
  onAdded,
  onCancel,
}: {
  onAdded: () => void;
  onCancel: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const payload = {
      name:         data.get('name') as string,
      category:     data.get('category') as string,
      amount:       parseFloat(data.get('amount') as string),
      date:         data.get('date') as string,
      is_recurring: data.get('is_recurring') === 'on',
    };
    try {
      const res = await fetch(`${API_URL}/api/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage('Transaction ajoutée !');
        formRef.current?.reset();
        onAdded();
      } else {
        setMessage("Erreur lors de l'ajout.");
      }
    } catch {
      setMessage('Erreur serveur.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Nouvelle transaction</h2>
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('ajoutée') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              id="add-name"
              name="name"
              type="text"
              placeholder="Ex: Courses Lidl"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="add-category" className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
            <select
              id="add-category"
              name="category"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Choisir</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="add-amount" className="block text-sm font-medium text-slate-700 mb-1">Montant (€, négatif = dépense)</label>
            <input
              id="add-amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="Ex: -45.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="add-date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              id="add-date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input name="is_recurring" type="checkbox" className="w-4 h-4 accent-indigo-600" />
          <span className="text-sm text-slate-600">🔄 Prélèvement récurrent (mensuel)</span>
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Ajout…' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setTransactions(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleSave = useCallback(async (
    id: number,
    data: Omit<Transaction, 'id' | 'updated_at'>
  ): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setTransactions(prev => prev.map(t => t.id === id ? updated : t));
        setEditingTransaction(null);
        return null;
      }
      const body = await res.json().catch(() => ({}));
      return body.message || 'Erreur lors de la sauvegarde.';
    } catch {
      return 'Erreur serveur.';
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette transaction ?')) return;
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setTransactions(prev => prev.filter(t => t.id !== id));
    } catch {}
  };

  const filtered = transactions.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterCat || t.category === filterCat)
  );

  const totalRevenus = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalDepenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const solde = totalRevenus - totalDepenses;

  return (
    <>
      {/* Modale d'édition (unique, toujours hors du tableau) */}
      {editingTransaction && (
        <EditModal
          transaction={editingTransaction}
          onSave={handleSave}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mes Transactions</h1>
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(transactions)}
                disabled={transactions.length === 0}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition disabled:opacity-40"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
              >
                {showForm ? <><X size={16} /> Annuler</> : <><Plus size={16} /> Ajouter</>}
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white rounded-2xl shadow p-3 sm:p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Revenus</p>
              <p className="text-base sm:text-xl font-bold text-green-600">+{totalRevenus.toFixed(2)}€</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-3 sm:p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Dépenses</p>
              <p className="text-base sm:text-xl font-bold text-red-500">-{totalDepenses.toFixed(2)}€</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-3 sm:p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Solde</p>
              <p className={`text-base sm:text-xl font-bold ${solde >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                {solde >= 0 ? '+' : ''}{solde.toFixed(2)}€
              </p>
            </div>
          </div>

          {/* Formulaire ajout — composant isolé, zéro re-render parent pendant la frappe */}
          {showForm && (
            <AddForm
              onAdded={() => { setShowForm(false); fetchTransactions(); }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Filtres */}
          <div className="bg-white rounded-2xl shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow text-center py-12 text-slate-500">
              <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
              <p className="text-sm">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium">{transactions.length === 0 ? 'Aucune transaction' : 'Aucun résultat'}</p>
            </div>
          ) : (
            <>
              {/* === MOBILE : cartes === */}
              <div className="flex flex-col gap-3 sm:hidden">
                {filtered.map(t => (
                  <div key={t.id} className="bg-white rounded-2xl shadow p-4 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.category}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(t.date).toLocaleDateString('fr-FR')}
                        {t.is_recurring && <span className="ml-2 text-indigo-500">🔄</span>}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`font-bold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {t.amount > 0 ? '+' : ''}{Number(t.amount).toFixed(2)}€
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingTransaction(t)}
                          className="p-1.5 text-indigo-400 hover:bg-indigo-50 rounded-lg transition"
                          aria-label="Modifier"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* === DESKTOP : tableau === */}
              <div className="hidden sm:block bg-white rounded-2xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Catégorie</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Montant</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Récurrent</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Modifié le</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                          <td className="px-6 py-4 text-slate-600 text-sm">{t.category}</td>
                          <td className={`px-6 py-4 font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {t.amount > 0 ? '+' : ''}{Number(t.amount).toFixed(2)}€
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {new Date(t.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {t.is_recurring
                              ? <span className="text-indigo-600 font-medium">🔄 Oui</span>
                              : <span className="text-slate-400">Non</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {t.updated_at
                              ? new Date(t.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingTransaction(t)}
                                className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition"
                                aria-label="Modifier"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                                aria-label="Supprimer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {filtered.length > 0 && (
            <p className="text-center text-xs text-slate-400">
              {filtered.length} transaction{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
