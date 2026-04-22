'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, Plus, X, Download } from 'lucide-react';

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

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState({
    name: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], is_recurring: false,
  });

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (res.ok) {
        setMessage('Transaction ajoutée !');
        setForm({ name: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], is_recurring: false });
        setShowForm(false);
        fetchTransactions();
      } else {
        setMessage("Erreur lors de l'ajout.");
      }
    } catch {
      setMessage('Erreur serveur.');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Mes Transactions</h1>
          <div className="flex gap-2">
            <button
              onClick={() => exportCSV(transactions)}
              disabled={transactions.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition disabled:opacity-40"
            >
              <Download size={16} /> Export CSV
            </button>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
            >
              {showForm ? <><X size={16} /> Annuler</> : <><Plus size={16} /> Ajouter</>}
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Revenus</p>
            <p className="text-xl font-bold text-green-600">+{totalRevenus.toFixed(2)}€</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Dépenses</p>
            <p className="text-xl font-bold text-red-500">-{totalDepenses.toFixed(2)}€</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Solde</p>
            <p className={`text-xl font-bold ${totalRevenus - totalDepenses >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
              {totalRevenus - totalDepenses >= 0 ? '+' : ''}{(totalRevenus - totalDepenses).toFixed(2)}€
            </p>
          </div>
        </div>

        {/* Formulaire ajout */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nouvelle transaction</h2>
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('ajoutée') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tl-name" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <input
                    id="tl-name"
                    type="text"
                    placeholder="Ex: Courses Lidl"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tl-category" className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <select
                    id="tl-category"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Choisir</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="tl-amount" className="block text-sm font-medium text-slate-700 mb-1">Montant (€, négatif = dépense)</label>
                  <input
                    id="tl-amount"
                    type="number"
                    step="0.01"
                    placeholder="Ex: -45.00"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tl-date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    id="tl-date"
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_recurring}
                  onChange={e => setForm({ ...form, is_recurring: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm text-slate-600">🔄 Prélèvement récurrent (mensuel)</span>
              </label>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
              >
                Ajouter
              </button>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row gap-3">
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

        {/* Tableau */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
              <p className="text-sm">Chargement...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium">{transactions.length === 0 ? 'Aucune transaction' : 'Aucun résultat'}</p>
            </div>
          ) : (
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
                        {t.is_recurring ? <span className="text-indigo-600 font-medium">🔄 Oui</span> : <span className="text-slate-400">Non</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {t.updated_at
                          ? new Date(t.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-slate-400">
            {filtered.length} transaction{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
