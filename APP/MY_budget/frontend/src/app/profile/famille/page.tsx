'use client';
import React, { useState } from 'react';
import { useProfileDashboard } from '../useProfileDashboard';
import {
  Home, Receipt, Target, User, Plus, X, Trash2,
  ArrowUpRight, ArrowDownRight, Eye, EyeOff, Menu, Bell, Search,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const CATEGORIES = [
  { value: 'Alimentation', label: '🛒 Alimentation' },
  { value: 'Transport', label: '🚗 Transport' },
  { value: 'Santé', label: '⚕️ Santé' },
  { value: 'Éducation', label: '📚 Éducation' },
  { value: 'Loisirs', label: '🎮 Loisirs' },
  { value: 'Abonnements', label: '📱 Abonnements' },
  { value: 'Vêtements', label: '👕 Vêtements' },
  { value: 'Prélèvement', label: '🏦 Prélèvement' },
  { value: 'Revenus', label: '💰 Revenus' },
];

// ─── Widget Fonds d'urgence famille ──────────────────────────────────────────
const FondsUrgenceWidget = ({ stats, nbEnfants }: { stats: any; nbEnfants: number }) => {
  const cibles = stats.depenses * 3;
  const solde = Math.max(0, stats.solde);
  const pct = cibles > 0 ? Math.min(Math.round((solde / cibles) * 100), 100) : 0;

  return (
    <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-3xl p-6 border border-rose-100 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-rose-800">🛡️ Fonds d'urgence familial</h3>
        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-medium">Famille</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Épargne actuelle</p>
          <p className="font-bold text-rose-700 text-sm">€{solde.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Objectif 3 mois</p>
          <p className="font-bold text-purple-600 text-sm">€{cibles.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Personnes</p>
          <p className="font-bold text-gray-700 text-sm">{2 + nbEnfants} 👨‍👩‍👧</p>
        </div>
      </div>

      <div className="h-3 bg-rose-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-gradient-to-r from-rose-400 to-purple-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-right text-rose-500 font-medium mb-3">{pct}% atteint</p>

      {nbEnfants > 0 && (
        <div className="bg-white/80 rounded-2xl p-3 border border-rose-100">
          <p className="text-xs text-purple-700 font-medium">
            👶 Avec {nbEnfants} enfant{nbEnfants > 1 ? 's' : ''} — pensez à ouvrir un livret épargne dédié pour leurs études.
          </p>
        </div>
      )}
      <p className="text-xs text-rose-600 mt-3 font-medium">
        {pct >= 100 ? '🎉 Fonds d\'urgence constitué ! Bravo !' : `💡 Il vous manque €${Math.max(0, cibles - solde).toFixed(0)} pour 3 mois de charges.`}
      </p>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export default function FamillePage() {
  const db = useProfileDashboard();
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const nbEnfants = db.answers?.nbEnfants || 0;

  if (!db.user) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl animate-spin inline-block mb-2">⏳</div><p className="text-rose-600 font-medium">Chargement...</p></div>
    </div>
  );

  const NavItem = ({ icon: Icon, label, id }: { icon: any; label: string; id: string }) => (
    <button onClick={() => { setPage(id); setMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full transition-all ${page === id ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-lg' : 'text-gray-700 hover:bg-rose-50'}`}>
      <Icon size={20} /><span className="font-medium">{label}</span>
    </button>
  );

  const getCatIcon = (amount: number, cat: string) => {
    if (amount > 0) return '💰';
    const icons: Record<string, string> = { Alimentation: '🛒', Transport: '🚗', Santé: '⚕️', Éducation: '📚', Loisirs: '🎮', Abonnements: '📱', Vêtements: '👕', Prélèvement: '🏦' };
    return icons[cat] || '💸';
  };

  // ── Dashboard ──
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-rose-200 text-sm">Espace Famille</p>
            <h2 className="text-2xl font-bold mt-1">Bienvenue {db.user?.name?.split(' ')[0]} 👨‍👩‍👧</h2>
            <p className="text-rose-200 text-sm mt-1">
              {nbEnfants > 0 ? `Famille de ${2 + nbEnfants} — budget partagé` : 'Budget familial optimisé'}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">👨‍👩‍👧</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-3xl p-5 text-white shadow-xl">
          <div className="flex justify-between items-start mb-3">
            <p className="text-rose-100 text-sm">Solde du foyer</p>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 bg-white/20 rounded-lg">
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <h2 className="text-3xl font-bold">{showBalance ? `€${db.stats.solde.toFixed(2)}` : '••••'}</h2>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-5 text-white shadow-xl">
          <p className="text-emerald-100 text-sm mb-3">Revenus</p>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={20} /><h3 className="text-2xl font-bold">€{db.stats.revenus.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-5 text-white shadow-xl">
          <p className="text-rose-100 text-sm mb-3">Dépenses</p>
          <div className="flex items-center gap-2">
            <ArrowDownRight size={20} /><h3 className="text-2xl font-bold">€{db.stats.depenses.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Widget fonds d'urgence */}
      <FondsUrgenceWidget stats={db.stats} nbEnfants={nbEnfants} />

      {/* Graphique */}
      {db.categoryData.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Dépenses du foyer</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={db.categoryData} cx="50%" cy="50%" outerRadius={90}
                label={(p: any) => `${p.name}: €${p.spent}`} dataKey="spent">
                {db.categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transactions récentes */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Dernières dépenses</h3>
          <button onClick={() => setPage('transactions')} className="text-rose-500 text-sm font-medium flex items-center gap-1">
            Voir tout <Receipt size={14} />
          </button>
        </div>
        {db.transactions.slice(0, 4).map(t => (
          <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getCatIcon(t.amount, t.category)}</span>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.category} · {new Date(t.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <span className={`font-bold ${t.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {t.amount > 0 ? '+' : ''}€{Math.abs(t.amount).toFixed(2)}
            </span>
          </div>
        ))}
        {db.transactions.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">Aucune transaction — ajoutez la première !</p>}
      </div>
    </div>
  );

  // ── Transactions ──
  const TransactionsView = () => (
    <div className="space-y-6">
      {db.showAddForm && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Ajouter une dépense</h2>
            <button onClick={() => db.setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
          </div>
          {db.message && <div className={`mb-4 p-3 rounded-xl text-sm ${db.message.includes('ajoutée') ? 'bg-rose-50 text-rose-700' : 'bg-red-50 text-red-700'}`}>{db.message}</div>}
          <form onSubmit={db.handleAddTransaction} className="space-y-3">
            <input type="text" placeholder="Description" value={db.formData.name}
              onChange={e => db.setFormData({ ...db.formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-900" required />
            <select value={db.formData.category} onChange={e => db.setFormData({ ...db.formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-900" required>
              <option value="">Catégorie</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Montant (€)" step="0.01" value={db.formData.amount}
                onChange={e => db.setFormData({ ...db.formData, amount: e.target.value })}
                className="px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-900" required />
              <input type="date" value={db.formData.date}
                onChange={e => db.setFormData({ ...db.formData, date: e.target.value })}
                className="px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-900" required />
            </div>
            <label className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl cursor-pointer">
              <input type="checkbox" checked={db.formData.is_recurring}
                onChange={e => db.setFormData({ ...db.formData, is_recurring: e.target.checked })} className="w-4 h-4 accent-rose-500" />
              <span className="text-sm text-rose-700 font-medium">🔄 Prélèvement récurrent</span>
            </label>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-xl font-semibold">
              <Plus size={18} className="inline mr-2" />Ajouter
            </button>
          </form>
        </div>
      )}

      {db.editingTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Modifier</h2>
              <button onClick={() => db.setEditingTransaction(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={db.handleEditTransaction} className="space-y-3">
              <input type="text" value={db.editingTransaction.name}
                onChange={e => db.setEditingTransaction({ ...db.editingTransaction, name: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl text-gray-900" required />
              <select value={db.editingTransaction.category}
                onChange={e => db.setEditingTransaction({ ...db.editingTransaction, category: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-xl text-gray-900" required>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" value={db.editingTransaction.amount}
                  onChange={e => db.setEditingTransaction({ ...db.editingTransaction, amount: e.target.value })}
                  className="px-4 py-2.5 border rounded-xl text-gray-900" required />
                <input type="date" value={db.editingTransaction.date?.split('T')[0]}
                  onChange={e => db.setEditingTransaction({ ...db.editingTransaction, date: e.target.value })}
                  className="px-4 py-2.5 border rounded-xl text-gray-900" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => db.setEditingTransaction(null)}
                  className="flex-1 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-semibold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" size={20} />
            <input type="text" placeholder="Rechercher..." value={db.searchText}
              onChange={e => db.setSearchText(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-900" />
          </div>
          <div className="flex gap-3">
            <select value={db.filterCategory} onChange={e => db.setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-gray-900">
              <option value="">Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={() => db.setShowAddForm(!db.showAddForm)}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-2xl font-medium shadow flex items-center gap-2">
              <Plus size={18} /> Ajouter
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {db.loading ? <p className="text-center py-8 text-gray-400">⏳ Chargement...</p>
          : db.filteredTransactions.length === 0 ? <p className="text-center py-8 text-gray-400">Aucune transaction.</p>
          : db.filteredTransactions.map(t => (
            <div key={t.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCatIcon(t.amount, t.category)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    {t.is_recurring && <span className="text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">🔄 Récurrent</span>}
                  </div>
                  <p className="text-xs text-gray-400">{t.category} · {new Date(t.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${t.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {t.amount > 0 ? '+' : ''}€{Math.abs(t.amount).toFixed(2)}
                </span>
                <button onClick={() => db.setEditingTransaction({ ...t, amount: String(t.amount) })}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => db.handleDeleteTransaction(t.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Budget ──
  const BudgetView = () => {
    const budgets = [
      { name: 'Alimentation', budget: 600, icon: '🛒', color: '#FF6B6B' },
      { name: 'Transport', budget: 250, icon: '🚗', color: '#4ECDC4' },
      { name: 'Santé', budget: 150, icon: '⚕️', color: '#45B7D1' },
      { name: 'Éducation', budget: nbEnfants * 100 || 100, icon: '📚', color: '#96CEB4' },
      { name: 'Loisirs', budget: 200, icon: '🎮', color: '#FFEAA7' },
      { name: 'Abonnements', budget: 80, icon: '📱', color: '#DDA0DD' },
    ].map(b => ({ ...b, spent: db.categoryData.find(c => c.name === b.name)?.spent || 0 }));

    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Budgets du foyer</h3>
        {nbEnfants > 0 && (
          <p className="text-sm text-rose-500 mb-5">Budget Éducation ajusté pour {nbEnfants} enfant{nbEnfants > 1 ? 's' : ''}</p>
        )}
        <div className="space-y-4">
          {budgets.map((b, i) => {
            const pct = b.budget > 0 ? (b.spent / b.budget) * 100 : 0;
            return (
              <div key={i} className="p-4 rounded-2xl bg-gray-50 hover:bg-rose-50 transition cursor-pointer"
                onClick={() => setSelectedCat(selectedCat === i ? null : i)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{b.name}</p>
                      <p className="text-xs text-gray-400">€{b.spent.toFixed(2)} / €{b.budget}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${pct >= 90 ? 'bg-red-100 text-red-600' : pct >= 70 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: b.color }} />
                </div>
                {selectedCat === i && (
                  <p className="text-sm text-rose-600 mt-2">Restant : <span className="font-bold">€{Math.max(0, b.budget - b.spent).toFixed(2)}</span></p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Objectifs ──
  const GoalsView = () => (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
      <Target size={48} className="mx-auto mb-4 text-rose-500" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Objectifs familiaux</h3>
      <p className="text-gray-500 text-sm mb-6">
        {db.answers?.objectifsEpargne?.length > 0
          ? `Vos objectifs : ${db.answers.objectifsEpargne.join(', ')}`
          : 'Définissez vos objectifs depuis le questionnaire.'}
      </p>
      {nbEnfants > 0 && (
        <div className="bg-rose-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm text-rose-700 font-medium">💡 Conseil : ouvrez un livret épargne pour les études de vos enfants.</p>
        </div>
      )}
      <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-2xl font-medium shadow">
        + Ajouter un objectif
      </button>
    </div>
  );

  // ── Profil ──
  const ProfilView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-xl">
            {db.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{db.user?.name}</h3>
          <p className="text-gray-400 text-sm">{db.user?.email}</p>
          <span className="mt-2 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">👨‍👩‍👧 Profil Famille</span>
          {nbEnfants > 0 && (
            <span className="mt-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{nbEnfants} enfant{nbEnfants > 1 ? 's' : ''}</span>
          )}
        </div>
        <button onClick={db.changeProfile}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition">
          Changer de profil
        </button>
      </div>
      <button onClick={db.logout} className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold shadow-xl transition">
        Déconnexion
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50 to-purple-50">
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu size={22} /></button>
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow">MSB</div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">My Smart Budget</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl relative">
              <Bell size={20} /><span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <span className="hidden md:block text-sm font-medium text-gray-700">{db.user?.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <aside className={`md:w-56 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 h-fit ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="space-y-1">
            <NavItem icon={Home} label="Dashboard" id="dashboard" />
            <NavItem icon={Receipt} label="Transactions" id="transactions" />
            <NavItem icon={Target} label="Budget" id="budget" />
            <NavItem icon={Target} label="Objectifs" id="goals" />
            <NavItem icon={User} label="Profil" id="profile" />
          </nav>
        </aside>

        <main className="flex-1">
          {page === 'dashboard' && <DashboardView />}
          {page === 'transactions' && <TransactionsView />}
          {page === 'budget' && <BudgetView />}
          {page === 'goals' && <GoalsView />}
          {page === 'profile' && <ProfilView />}
        </main>
      </div>
    </div>
  );
}
