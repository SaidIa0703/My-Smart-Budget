'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const CATEGORY_ICONS: Record<string, string> = {
  alimentation: '🛒', transport: '🚗', loisirs: '🎮', sante: '⚕️',
  abonnements: '📱', restauration: '🍽️', vetements: '👕', education: '📚',
  logement: '🏠', electricite: '💡', eau: '💧', sport: '🏋️',
  voyages: '✈️', cadeaux: '🎁', epargne: '🏦', autre: '📋',
};

const CATEGORIES = [
  'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Abonnements',
  'Restauration', 'Vêtements', 'Éducation', 'Logement', 'Électricité',
  'Eau', 'Sport', 'Voyages', 'Cadeaux', 'Épargne', 'Autre',
];

interface Budget {
  id: number;
  category: string;
  limit: number;
  current_spending: number;
}

interface FormState {
  category: string;
  limit: string;
}

const getIcon = (category: string) =>
  CATEGORY_ICONS[category.toLowerCase().normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '')] || '💰';

const getStatus = (spending: number, limit: number): 'normal' | 'warning' | 'alert' | 'danger' => {
  const pct = spending / limit;
  if (pct >= 1)   return 'danger';
  if (pct >= 0.9) return 'alert';
  if (pct >= 0.7) return 'warning';
  return 'normal';
};

const statusColors = {
  normal:  { bar: 'from-blue-500 to-purple-600',   bg: 'bg-slate-50 hover:bg-blue-50',    border: 'border-slate-200' },
  warning: { bar: 'from-amber-400 to-yellow-400',  bg: 'bg-amber-50 hover:bg-amber-100',  border: 'border-amber-200' },
  alert:   { bar: 'from-orange-500 to-red-400',    bg: 'bg-orange-50 hover:bg-orange-100', border: 'border-orange-300' },
  danger:  { bar: 'from-red-500 to-red-600',       bg: 'bg-red-50 hover:bg-red-100',      border: 'border-red-200' },
};

export default function BudgetCategories() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState<FormState>({ category: '', limit: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const token = globalThis.window === undefined ? null : sessionStorage.getItem('token') || localStorage.getItem('token');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/budgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur chargement');
      setBudgets(await res.json());
    } catch {
      setError('Impossible de charger les budgets.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const openAdd = () => {
    setEditing(null);
    setForm({ category: '', limit: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (b: Budget) => {
    setEditing(b);
    setForm({ category: b.category, limit: String(b.limit) });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setFormError(''); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.category || !form.limit || Number(form.limit) <= 0) {
      setFormError('Remplis tous les champs avec un montant positif.');
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `${API_URL}/api/budgets/${editing.id}`
        : `${API_URL}/api/budgets`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: form.category, limit: Number(form.limit) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.message || 'Erreur lors de la sauvegarde.');
        return;
      }
      closeModal();
      fetchBudgets();
    } catch {
      setFormError('Erreur serveur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce budget ?')) return;
    try {
      await fetch(`${API_URL}/api/budgets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets();
    } catch {}
  };

  const exceeded = budgets.filter(b => Number(b.current_spending) >= Number(b.limit));

  const totalLimit    = budgets.reduce((s, b) => s + Number(b.limit), 0);
  const totalSpending = budgets.reduce((s, b) => s + Number(b.current_spending), 0);
  const resteAVivre   = Math.max(totalLimit - totalSpending, 0);

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">💰 Budgets par Catégorie</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={16} /> Nouveau budget
        </button>
      </div>

      {/* Reste à vivre */}
      {!loading && !error && budgets.length > 0 && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3">
          <div>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Reste à vivre mensuel</p>
            <p className="text-2xl font-bold text-indigo-700 mt-0.5">{resteAVivre.toFixed(2)} €</p>
          </div>
          <div className="text-right text-xs text-indigo-400">
            <p>{totalSpending.toFixed(0)} € dépensés</p>
            <p>sur {totalLimit.toFixed(0)} € budgétés</p>
          </div>
        </div>
      )}

      {/* Alerte dépassements */}
      {exceeded.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              {exceeded.length} budget{exceeded.length > 1 ? 's' : ''} dépassé{exceeded.length > 1 ? 's' : ''} ce mois !
            </p>
            <p className="text-xs mt-0.5 text-red-600">
              {exceeded.map(b => b.category).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* États */}
      {loading && (
        <div className="text-center py-10 text-slate-500">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm">Chargement...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && budgets.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">💡</p>
          <p className="font-medium">Aucun budget défini</p>
          <p className="text-sm mt-1">Crée ton premier budget pour suivre tes dépenses.</p>
        </div>
      )}

      {/* Liste */}
      {!loading && !error && (
        <div className="space-y-4">
          {budgets.map(budget => {
            const spending = Number(budget.current_spending);
            const limit = Number(budget.limit);
            const pct = Math.min((spending / limit) * 100, 110);
            const remaining = Math.max(limit - spending, 0);
            const status = getStatus(spending, limit);
            const colors = statusColors[status];

            return (
              <div
                key={budget.id}
                className={`border-2 ${colors.border} ${colors.bg} rounded-2xl p-5 transition-all duration-200`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getIcon(budget.category)}</span>
                    <h3 className="font-semibold text-slate-900">{budget.category}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">
                      {spending.toFixed(0)}€ / {limit.toFixed(0)}€
                    </span>
                    <button
                      onClick={() => openEdit(budget)}
                      className="p-1.5 hover:bg-white rounded-lg transition"
                      aria-label="Modifier"
                    >
                      <Pencil size={14} className="text-slate-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 hover:bg-white rounded-lg transition"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>
                    {status === 'danger'  && '❌ Dépassé !'}
                    {status === 'alert'   && `🔶 ${Math.round(pct)}% — Alerte 90%`}
                    {status === 'warning' && `⚠️ ${Math.round(pct)}% — Alerte 70%`}
                    {status === 'normal'  && `✅ ${Math.round(pct)}% utilisé`}
                  </span>
                  <span>
                    {status === 'danger'
                      ? `-${(spending - limit).toFixed(0)} € au-dessus`
                      : `${remaining.toFixed(0)} € restant`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ajout / édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                {editing ? 'Modifier le budget' : 'Nouveau budget'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="budget-category" className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                <select
                  id="budget-category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                >
                  <option value="">Choisir une catégorie</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{getIcon(c)} {c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="budget-limit" className="block text-sm font-medium text-slate-700 mb-1">Limite mensuelle (€)</label>
                <input
                  id="budget-limit"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ex: 350"
                  value={form.limit}
                  onChange={e => setForm({ ...form, limit: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving && 'Sauvegarde...'}
                  {!saving && editing && 'Modifier'}
                  {!saving && !editing && 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
