'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const ICONS = ['🎯', '✈️', '🏡', '🌅', '🛡️', '🚗', '📚', '📈', '💍', '💻', '🏋️', '🎓', '🎮', '🏖️', '🎸'];
const COLORS = [
  { label: 'Indigo',   value: '#6366f1' },
  { label: 'Bleu',     value: '#45B7D1' },
  { label: 'Vert',     value: '#4ECDC4' },
  { label: 'Vert clair', value: '#96CEB4' },
  { label: 'Rouge',    value: '#FF6B6B' },
  { label: 'Jaune',    value: '#FFEAA7' },
  { label: 'Violet',   value: '#DDA0DD' },
  { label: 'Rose',     value: '#f472b6' },
];

interface Goal {
  id: number;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
}

interface FormState {
  name: string;
  icon: string;
  target_amount: string;
  current_amount: string;
  deadline: string;
  color: string;
}

const defaultForm: FormState = {
  name: '', icon: '🎯', target_amount: '', current_amount: '0', deadline: '', color: '#6366f1',
};

const getBadge = (current: number, target: number, deadline: string | null) => {
  const pct = current / target;
  if (pct >= 1) return { label: 'Complété', color: 'from-green-100 to-emerald-100', text: 'text-green-700' };
  if (deadline && new Date(deadline) < new Date(Date.now() + 90 * 24 * 3600 * 1000)) {
    return { label: 'Bientôt', color: 'from-amber-100 to-orange-100', text: 'text-amber-700' };
  }
  if (pct < 0.3) return { label: 'Longue durée', color: 'from-blue-100 to-indigo-100', text: 'text-indigo-700' };
  return { label: 'En cours', color: 'from-emerald-100 to-teal-100', text: 'text-emerald-700' };
};

export default function SavingsGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const token = globalThis.window === undefined ? null : sessionStorage.getItem('token') || localStorage.getItem('token');

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setGoals(await res.json());
    } catch {
      setError('Impossible de charger les objectifs.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (g: Goal) => {
    setEditing(g);
    setForm({
      name: g.name,
      icon: g.icon,
      target_amount: String(g.target_amount),
      current_amount: String(g.current_amount),
      deadline: g.deadline ? g.deadline.split('T')[0] : '',
      color: g.color,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setFormError(''); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.target_amount || Number(form.target_amount) <= 0) {
      setFormError('Nom et montant cible (positif) requis.');
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `${API_URL}/api/goals/${editing.id}` : `${API_URL}/api/goals`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name.trim(),
          icon: form.icon,
          target_amount: Number(form.target_amount),
          current_amount: Number(form.current_amount || 0),
          deadline: form.deadline || null,
          color: form.color,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.message || 'Erreur lors de la sauvegarde.');
        return;
      }
      closeModal();
      fetchGoals();
    } catch {
      setFormError('Erreur serveur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet objectif ?')) return;
    try {
      await fetch(`${API_URL}/api/goals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGoals();
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">🎯 Objectifs d'Épargne</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={16} /> Nouvel objectif
        </button>
      </div>

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

      {!loading && !error && goals.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-medium">Aucun objectif défini</p>
          <p className="text-sm mt-1">Crée ton premier objectif d'épargne !</p>
        </div>
      )}

      {/* Liste */}
      {!loading && !error && (
        <div className="space-y-4">
          {goals.map(goal => {
            const current = Number(goal.current_amount);
            const target = Number(goal.target_amount);
            const pct = Math.min((current / target) * 100, 100);
            const remaining = target - current;
            const badge = getBadge(current, target, goal.deadline);

            return (
              <div
                key={goal.id}
                className="border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.icon}</span>
                    <h3 className="font-semibold text-slate-900">{goal.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${badge.color} ${badge.text}`}>
                      {badge.label}
                    </span>
                    <button onClick={() => openEdit(goal)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" aria-label="Modifier">
                      <Pencil size={14} className="text-slate-500" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" aria-label="Supprimer">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: goal.color }}
                  />
                </div>

                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>{current.toLocaleString('fr-FR')}€ / {target.toLocaleString('fr-FR')}€</span>
                  <span>
                    {remaining > 0 ? `${remaining.toLocaleString('fr-FR')}€ restant` : 'Complété ! 🎉'}
                  </span>
                </div>

                {goal.deadline && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    Échéance : {new Date(goal.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                {editing ? 'Modifier l\'objectif' : 'Nouvel objectif'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Nom */}
              <div>
                <label htmlFor="goal-name" className="block text-sm font-medium text-slate-700 mb-1">Nom de l'objectif</label>
                <input
                  id="goal-name"
                  type="text"
                  placeholder="Ex: Vacances d'été"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
              </div>

              {/* Icône */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Icône</p>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`text-2xl p-2 rounded-xl border-2 transition ${form.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-slate-200'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-target" className="block text-sm font-medium text-slate-700 mb-1">Montant cible (€)</label>
                  <input
                    id="goal-target"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Ex: 2000"
                    value={form.target_amount}
                    onChange={e => setForm({ ...form, target_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="goal-current" className="block text-sm font-medium text-slate-700 mb-1">Déjà épargné (€)</label>
                  <input
                    id="goal-current"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 500"
                    value={form.current_amount}
                    onChange={e => setForm({ ...form, current_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Échéance */}
              <div>
                <label htmlFor="goal-deadline" className="block text-sm font-medium text-slate-700 mb-1">Échéance (optionnel)</label>
                <input
                  id="goal-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* Couleur */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Couleur</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-8 h-8 rounded-full border-2 transition ${form.color === c.value ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c.value }}
                      aria-label={c.label}
                    />
                  ))}
                </div>
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
