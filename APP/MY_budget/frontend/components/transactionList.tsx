'use client';

import { useEffect, useState, useCallback } from 'react';
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

interface EditForm {
  name: string;
  category: string;
  amount: string;
  date: string;
  is_recurring: boolean;
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

  // État édition
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', category: '', amount: '', date: '', is_recurring: false,
  });
  const [editMessage, setEditMessage] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditMessage('');
    setEditForm({
      name: t.name,
      category: t.category,
      amount: String(t.amount),
      date: t.date.split('T')[0],
      is_recurring: t.is_recurring,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMessage('');
  };

  const handleEdit = async (id: number) => {
    if (!editForm.name || !editForm.category || !editForm.amount) {
      setEditMessage('Tous les champs sont requis.');
      return;
    }
    setEditLoading(true);
    setEditMessage('');
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          amount: parseFloat(editForm.amount),
          date: editForm.date,
          is_recurring: editForm.is_recurring,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTransactions(prev => prev.map(t => t.id === id ? updated : t));
        setEditingId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setEditMessage(data.message || 'Erreur lors de la sauvegarde.');
      }
    } catch {
      setEditMessage('Erreur serveur.');
    }
    setEditLoading(false);
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
  const solde = totalRevenus - totalDepenses;

  return (
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
              onClick={() => { setShowForm(v => !v); setEditingId(null); }}
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

        {/* Formulaire ajout */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
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
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
              >
                Ajouter
              </button>
            </form>
          </div>
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

        {/* Contenu */}
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
            {/* === VUE MOBILE : cartes === */}
            <div className="flex flex-col gap-3 sm:hidden">
              {filtered.map(t => (
                <div key={t.id} className="bg-white rounded-2xl shadow p-4">
                  {editingId === t.id ? (
                    /* Formulaire d'édition mobile */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Montant (€)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.amount}
                            onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie</label>
                          <select
                            value={editForm.category}
                            onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.is_recurring}
                          onChange={e => setEditForm({ ...editForm, is_recurring: e.target.checked })}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-xs text-slate-600">Récurrent</span>
                      </label>
                      {editMessage && <p className="text-xs text-red-500">{editMessage}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(t.id)}
                          disabled={editLoading}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                          <Check size={14} /> Enregistrer
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 flex items-center justify-center gap-1 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition"
                        >
                          <X size={14} /> Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Affichage normal mobile */
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.category}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(t.date).toLocaleDateString('fr-FR')}
                          {t.is_recurring && <span className="ml-2 text-indigo-500">🔄</span>}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`font-bold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {t.amount > 0 ? '+' : ''}{Number(t.amount).toFixed(2)}€
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(t)}
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
                  )}
                </div>
              ))}
            </div>

            {/* === VUE DESKTOP : tableau === */}
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
                      editingId === t.id ? (
                        /* Ligne d'édition inline */
                        <tr key={t.id} className="bg-indigo-50">
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editForm.category}
                              onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                              className="w-full px-2 py-1.5 border border-indigo-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount}
                              onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                              className="w-28 px-2 py-1.5 border border-indigo-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                              className="px-2 py-1.5 border border-indigo-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={editForm.is_recurring}
                              onChange={e => setEditForm({ ...editForm, is_recurring: e.target.checked })}
                              className="w-4 h-4 accent-indigo-600"
                            />
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-400">
                            {editMessage && <span className="text-red-500">{editMessage}</span>}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(t.id)}
                                disabled={editLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                aria-label="Enregistrer"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                                aria-label="Annuler"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        /* Ligne normale */
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
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(t)}
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
                      )
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
  );
}
