'use client';
import React, { useState } from 'react';
import { Target, Plus, X, Trash2, Pencil, Check } from 'lucide-react';
import type { Goal } from './useProfileDashboard';

const GOAL_ICONS = ['✈️','🏡','🌅','🛡️','🚗','📚','📈','💍','🎯','🎓','🏖️','💻','🐕','🎸'];
const GOAL_COLORS = [
  { label: 'Bleu',    value: '#45B7D1' },
  { label: 'Vert',    value: '#4ECDC4' },
  { label: 'Rose',    value: '#f472b6' },
  { label: 'Rouge',   value: '#FF6B6B' },
  { label: 'Violet',  value: '#6366f1' },
  { label: 'Jaune',   value: '#FBBF24' },
  { label: 'Mauve',   value: '#DDA0DD' },
  { label: 'Menthe',  value: '#96CEB4' },
];

interface Props {
  goals: Goal[];
  addGoal: (g: Omit<Goal, 'id'>) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
}

const EMPTY_FORM = {
  name: '',
  icon: '🎯',
  targetAmount: '',
  currentAmount: '',
  deadline: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
  color: '#6366f1',
};

export default function GoalsSection({ goals, addGoal, updateGoal, deleteGoal }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingGoal(null);
    setShowForm(true);
  };

  const openEdit = (g: Goal) => {
    setForm({
      name: g.name,
      icon: g.icon,
      targetAmount: String(g.targetAmount),
      currentAmount: String(g.currentAmount),
      deadline: g.deadline,
      color: g.color,
    });
    setEditingGoal(g);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      icon: form.icon,
      targetAmount: Number.parseFloat(form.targetAmount) || 0,
      currentAmount: Number.parseFloat(form.currentAmount) || 0,
      deadline: form.deadline,
      color: form.color,
    };
    if (editingGoal) {
      updateGoal({ ...editingGoal, ...payload });
    } else {
      addGoal(payload);
    }
    setShowForm(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const added = Number.parseFloat(depositAmount) || 0;
    updateGoal({ ...depositGoal, currentAmount: Math.min(depositGoal.currentAmount + added, depositGoal.targetAmount) });
    setDepositGoal(null);
    setDepositAmount('');
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Recap global ── */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-2xl">
            <p className="text-indigo-100 text-sm">Objectifs actifs</p>
            <p className="text-4xl font-bold mt-1">{goals.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl p-5 text-white shadow-2xl">
            <p className="text-emerald-100 text-sm">Total épargné</p>
            <p className="text-3xl font-bold mt-1">€{totalSaved.toFixed(0)}</p>
          </div>
          <div className="bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-5 text-white shadow-2xl">
            <p className="text-rose-100 text-sm">Objectif total</p>
            <p className="text-3xl font-bold mt-1">€{totalTarget.toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* ── Liste des objectifs ── */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mes Objectifs d'Épargne
          </h3>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow hover:shadow-xl transform hover:scale-105 transition-all">
            <Plus size={18} /> Ajouter
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16">
            <Target size={56} className="mx-auto text-indigo-300 mb-4" />
            <p className="text-xl font-bold text-slate-700 mb-2">Aucun objectif pour l'instant</p>
            <p className="text-violet-500 text-sm mb-6">Définissez vos premiers objectifs d'épargne pour les suivre ici.</p>
            <button onClick={openAdd}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow">
              + Créer un Objectif
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map(g => {
              const pct = g.targetAmount > 0 ? Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100) : 0;
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);
              const deadline = new Date(g.deadline);
              const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 3600 * 24));
              const done = pct >= 100;
              return (
                <div key={g.id} className="group p-5 rounded-2xl bg-gradient-to-r from-gray-50 via-transparent to-gray-50 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 border border-gray-100 hover:border-indigo-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: `${g.color}20`, border: `2px solid ${g.color}40` }}>
                        {g.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{g.name}</p>
                        <p className="text-xs text-violet-500">
                          {done ? '🎉 Objectif atteint !' : `€${remaining.toFixed(0)} restants · ${daysLeft > 0 ? `J-${daysLeft}` : 'Échu'}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      {!done && (
                        <button onClick={() => setDepositGoal(g)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition" title="Ajouter de l'épargne">
                          <Plus size={16} />
                        </button>
                      )}
                      <button onClick={() => openEdit(g)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteGoal(g.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: done ? '#10b981' : g.color, boxShadow: `0 0 8px ${g.color}60` }} />
                    </div>
                    <span className={`text-sm font-bold w-10 text-right ${done ? 'text-emerald-600' : 'text-slate-700'}`}>{pct}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-violet-500">€{g.currentAmount.toFixed(0)} / €{g.targetAmount.toFixed(0)}</span>
                    <span className="text-xs text-gray-400">Échéance : {deadline.toLocaleDateString('fr-FR')}</span>
                  </div>

                  {done && (
                    <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <Check size={16} className="text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">Félicitations ! Objectif atteint 🎉</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal ajout/édition ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingGoal ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nom */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nom de l'objectif</label>
                <input type="text" placeholder="Ex : Vacances été" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
              </div>

              {/* Icône */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Icône</label>
                <div className="grid grid-cols-7 gap-2">
                  {GOAL_ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                      className={`p-2 rounded-xl text-xl transition ${form.icon === ic ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleur */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Couleur</label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-8 h-8 rounded-xl transition transform hover:scale-110 ${form.color === c.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Objectif (€)</label>
                  <input type="number" min="1" step="1" placeholder="1000" value={form.targetAmount}
                    onChange={e => setForm({ ...form, targetAmount: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Épargne actuelle (€)</label>
                  <input type="number" min="0" step="1" placeholder="0" value={form.currentAmount}
                    onChange={e => setForm({ ...form, currentAmount: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" />
                </div>
              </div>

              {/* Échéance */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Échéance</label>
                <input type="date" value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Annuler</button>
                <button type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow">
                  {editingGoal ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal dépôt ── */}
      {depositGoal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900">Ajouter à l'objectif</h2>
              <button onClick={() => setDepositGoal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl mb-5">
              <span className="text-3xl">{depositGoal.icon}</span>
              <div>
                <p className="font-bold text-slate-900">{depositGoal.name}</p>
                <p className="text-sm text-violet-500">€{depositGoal.currentAmount.toFixed(0)} / €{depositGoal.targetAmount.toFixed(0)}</p>
              </div>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Montant à ajouter (€)</label>
                <input type="number" min="1" step="1" placeholder="Ex : 50" value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setDepositGoal(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Annuler</button>
                <button type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold shadow">
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
