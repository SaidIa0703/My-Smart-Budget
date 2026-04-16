'use client';
import React, { useState } from 'react';
import { useProfileDashboard } from '../useProfileDashboard';
import GoalsSection from '../GoalsSection';
import ProfileSection from '../ProfileSection';
import {
  TrendingUp, Plus, Home, Receipt, Wallet, Target, User,
  ChevronRight, X, ArrowUpRight, ArrowDownRight,
  Search, Eye, EyeOff, Menu, Trash2, Bell,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';

const CATEGORIES = [
  { value: 'Alimentation', label: '🛒 Alimentation' },
  { value: 'Transport', label: '🚗 Transport' },
  { value: 'Loisirs', label: '🎮 Loisirs' },
  { value: 'Abonnements', label: '📱 Abonnements' },
  { value: 'Santé', label: '⚕️ Santé' },
  { value: 'Prélèvement', label: '🏦 Prélèvement' },
  { value: 'Restauration', label: '🍽️ Restauration' },
  { value: 'Vêtements', label: '👕 Vêtements' },
  { value: 'Revenus', label: '💰 Revenus' },
];

// ─── Widget taux d'épargne ────────────────────────────────────────────────────
const EpargneWidget = ({ stats }: { stats: any }) => {
  const taux = stats.revenus > 0 ? Math.round((Math.max(0, stats.solde) / stats.revenus) * 100) : 0;
  const objectif = Math.round(stats.revenus * 0.15);
  const epargne = Math.max(0, stats.solde);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">💼 Taux d'épargne</h3>
        <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium border border-indigo-100">Salarié</span>
      </div>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-5xl font-bold text-slate-900">{taux}%</span>
        <span className="text-violet-500 text-sm mb-2">de tes revenus</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div className="absolute h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-purple-500"
          style={{ width: `${Math.min(taux, 100)}%` }} />
        <div className="absolute top-0 h-full w-0.5 bg-gray-400/40" style={{ left: '15%' }} title="Objectif 15%" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-gray-50 to-transparent border border-gray-100 text-center">
          <p className="text-xs text-violet-500 mb-1">Épargne réelle</p>
          <p className="font-bold text-slate-900">€{epargne.toFixed(0)}</p>
        </div>
        <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 text-center">
          <p className="text-xs text-violet-500 mb-1">Objectif 15%</p>
          <p className="font-bold text-indigo-700">€{objectif.toFixed(0)}</p>
        </div>
      </div>
      <p className="text-sm text-violet-500 mt-4">
        {taux >= 15 ? '✅ Excellent ! Tu dépasses les 15% recommandés.' : `💡 Il te manque €${Math.max(0, objectif - epargne).toFixed(0)} pour atteindre l'objectif de 15%.`}
      </p>
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SalariePage() {
  const db = useProfileDashboard();
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  if (!db.user) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
        <p className="text-violet-500 font-medium">Chargement...</p>
      </div>
    </div>
  );

  const getCategoryIcon = (amount: number, category: string): string => {
    if (amount > 0) return '💰';
    const icons: Record<string, string> = { Alimentation: '🛒', Transport: '🚗', Loisirs: '🎮', Abonnements: '📱', Santé: '⚕️', Prélèvement: '🏦', Restauration: '🍽️', Vêtements: '👕' };
    return icons[category] || '💸';
  };

  const NavItem = ({ icon: Icon, label, id }: { icon: any; label: string; id: string }) => (
    <button onClick={() => { setPage(id); setMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 w-full ${
        page === id
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}>
      <Icon size={22} className={page === id ? 'animate-pulse' : ''} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // ── Dashboard ──
  const DashboardPage = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Badge profil */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow border border-gray-100">
        <span className="text-2xl">💼</span>
        <div>
          <p className="font-bold text-slate-900">Espace Salarié</p>
          <p className="text-sm text-violet-500">Revenus fixes · Projets long terme</p>
        </div>
        <span className="ml-auto text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium border border-indigo-100">
          {db.answers?.revensuMensuels || '—'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Solde Total</p>
              <h2 className="text-4xl font-bold mt-2">{showBalance ? `€${db.stats.solde.toFixed(2)}` : '••••••'}</h2>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp size={18} />
            <span className="text-sm">{db.stats.solde > 0 ? '+' : ''}€{db.stats.solde.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Revenus</p>
              <h3 className="text-3xl font-bold mt-2">€{db.stats.revenus.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl"><ArrowUpRight size={24} /></div>
          </div>
          <p className="text-sm mt-4 text-emerald-100">Ce mois</p>
        </div>

        <div className="bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium">Dépenses</p>
              <h3 className="text-3xl font-bold mt-2">€{db.stats.depenses.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl"><ArrowDownRight size={24} /></div>
          </div>
          <p className="text-sm mt-4 text-rose-100">Ce mois</p>
        </div>
      </div>

      {/* Widget taux d'épargne */}
      <EpargneWidget stats={db.stats} />

      {/* Graphiques */}
      {db.categoryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Répartition des dépenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={db.categoryData} cx="50%" cy="50%" labelLine={false}
                  label={(p: any) => `${p.name}: €${p.spent}`} outerRadius={100} dataKey="spent">
                  {db.categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Dépenses par Catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={db.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spent" fill="#8884d8">
                  {db.categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transactions récentes */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Transactions Récentes</h3>
          <button onClick={() => setPage('transactions')} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Voir tout <ChevronRight size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {db.transactions.slice(0, 3).map((t, i) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getCategoryIcon(t.amount, t.category)}</div>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-violet-500">{t.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {t.amount > 0 ? '+' : ''}€{Math.abs(t.amount).toFixed(2)}
                </p>
                <p className="text-sm text-violet-500">{new Date(t.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ))}
          {db.transactions.length === 0 && (
            <p className="text-center text-gray-400 py-6">Aucune transaction — ajoutez la première !</p>
          )}
        </div>
      </div>
    </div>
  );

  // ── Transactions ──
  const TransactionsPage = () => (
    <div className="space-y-6 animate-fadeIn">
      {db.showAddForm && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ajouter une Transaction</h2>
            <button onClick={() => db.setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
          </div>
          {db.message && (
            <div className={`mb-4 p-4 rounded-lg ${db.message.includes('ajoutée') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{db.message}</div>
          )}
          <form onSubmit={db.handleAddTransaction} className="space-y-4">
            <input type="text" placeholder="Description" value={db.formData.name}
              onChange={e => db.setFormData({ ...db.formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
            <select value={db.formData.category} onChange={e => db.setFormData({ ...db.formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required>
              <option value="">Catégorie</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Montant (€)" step="0.01" value={db.formData.amount}
                onChange={e => db.setFormData({ ...db.formData, amount: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
              <input type="date" value={db.formData.date}
                onChange={e => db.setFormData({ ...db.formData, date: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
            </div>
            <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition">
              <input type="checkbox" checked={db.formData.is_recurring}
                onChange={e => db.setFormData({ ...db.formData, is_recurring: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">🔄 Prélèvement récurrent (mensuel)</span>
            </label>
            <button type="submit" className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2">
              <Plus size={20} /> Ajouter
            </button>
          </form>
        </div>
      )}

      {db.editingTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Modifier la transaction</h2>
              <button onClick={() => db.setEditingTransaction(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={22} /></button>
            </div>
            <form onSubmit={db.handleEditTransaction} className="space-y-4">
              <input type="text" value={db.editingTransaction.name}
                onChange={e => db.setEditingTransaction({ ...db.editingTransaction, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
              <select value={db.editingTransaction.category}
                onChange={e => db.setEditingTransaction({ ...db.editingTransaction, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" value={db.editingTransaction.amount}
                  onChange={e => db.setEditingTransaction({ ...db.editingTransaction, amount: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
                <input type="date" value={db.editingTransaction.date?.split('T')[0]}
                  onChange={e => db.setEditingTransaction({ ...db.editingTransaction, date: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black" required />
              </div>
              <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition">
                <input type="checkbox" checked={db.editingTransaction.is_recurring ?? false}
                  onChange={e => db.setEditingTransaction({ ...db.editingTransaction, is_recurring: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">🔄 Prélèvement récurrent (mensuel)</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => db.setEditingTransaction(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-slate-900">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500" size={24} />
            <input type="text" placeholder="🔍 Rechercher une transaction..." value={db.searchText}
              onChange={e => db.setSearchText(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium text-black" />
            {db.searchText && (
              <button onClick={() => db.setSearchText('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg">
                <X size={20} className="text-indigo-600" />
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select value={db.filterCategory} onChange={e => db.setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900">
              <option value="">📂 Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={() => db.setShowAddForm(!db.showAddForm)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
              <Plus size={20} /> Ajouter Transaction
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {db.loading ? (
            <div className="text-center py-12"><div className="inline-block animate-spin">⏳</div><p className="text-violet-500 mt-2">Chargement...</p></div>
          ) : db.filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <Search size={48} className="mx-auto text-indigo-400 mb-4" />
              <p className="text-xl font-bold text-indigo-900 mb-2">Aucune transaction trouvée</p>
              <p className="text-indigo-600">{db.searchText ? `Aucun résultat pour "${db.searchText}"` : 'Ajoutez votre première transaction !'}</p>
            </div>
          ) : db.filteredTransactions.map((t, i) => (
            <div key={t.id} className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-transparent hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border border-gray-200 hover:border-indigo-300"
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-4 flex-1">
                <div className="text-4xl">{getCategoryIcon(t.amount, t.category)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-lg">{t.name}</p>
                    {t.is_recurring && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">🔄 Récurrent</span>}
                  </div>
                  <p className="text-sm text-violet-500">{t.category} • {new Date(t.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className={`font-bold text-2xl whitespace-nowrap ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {t.amount > 0 ? '+' : ''}€{Math.abs(t.amount).toFixed(2)}
                </p>
                <button onClick={() => db.setEditingTransaction({ ...t, amount: String(t.amount) })}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition opacity-0 group-hover:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => db.handleDeleteTransaction(t.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Budget ──
  const BudgetPage = () => {
    const categoryBudgets = [
      { name: 'Alimentation', budget: 400, icon: '🛒', color: '#FF6B6B' },
      { name: 'Transport', budget: 150, icon: '🚗', color: '#4ECDC4' },
      { name: 'Loisirs', budget: 200, icon: '🎮', color: '#45B7D1' },
      { name: 'Abonnements', budget: 100, icon: '📱', color: '#96CEB4' },
      { name: 'Santé', budget: 80, icon: '⚕️', color: '#FFEAA7' },
      { name: 'Restauration', budget: 120, icon: '🍽️', color: '#DDA0DD' },
    ].map(b => ({ ...b, spent: db.categoryData.find(c => c.name === b.name)?.spent || 0 }));

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Budgets par Catégorie</h3>
          <div className="space-y-4">
            {categoryBudgets.map((cat, i) => {
              const pct = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
              return (
                <div key={i} className="group p-5 rounded-2xl bg-gradient-to-r from-gray-50 via-transparent to-gray-50 hover:from-indigo-50 hover:to-purple-50 transition-all duration-500 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900">{cat.name}</p>
                        <p className="text-sm text-violet-500">€{cat.spent.toFixed(2)} / €{cat.budget}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-full ${pct >= 90 ? 'bg-red-100 text-red-600' : pct >= 70 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {Math.round(pct)}%
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}50` }} />
                  </div>
                  {selectedCategory === i && (
                    <p className="text-sm text-indigo-600 mt-3">Budget restant : <span className="font-bold text-green-600">€{Math.max(0, cat.budget - cat.spent).toFixed(2)}</span></p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── Objectifs ──
  // ── Objectifs & Profil → composants partagés ──

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">MSB</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Smart Budget</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell size={22} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-900">{db.user?.name || 'User'}</span>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {db.user?.name ? db.user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <aside className={`md:w-64 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="space-y-2">
            <NavItem icon={Home} label="Dashboard" id="dashboard" />
            <NavItem icon={Receipt} label="Transactions" id="transactions" />
            <NavItem icon={Wallet} label="Budget" id="budget" />
            <NavItem icon={Target} label="Objectifs" id="goals" />
            <NavItem icon={User} label="Profil" id="profile" />
          </nav>
        </aside>
        <main className="flex-1">
          {page === 'dashboard' && <DashboardPage />}
          {page === 'transactions' && <TransactionsPage />}
          {page === 'budget' && <BudgetPage />}
          {page === 'goals' && (
            <GoalsSection
              goals={db.goals}
              addGoal={db.addGoal}
              updateGoal={db.updateGoal}
              deleteGoal={db.deleteGoal}
            />
          )}
          {page === 'profile' && (
            <ProfileSection
              user={db.user}
              settings={db.settings}
              updateSettings={db.updateSettings}
              logout={db.logout}
              changeProfile={db.changeProfile}
              profileBadge="💼 Profil Salarié"
              profileLabel="Salarié"
            />
          )}
        </main>
      </div>
    </div>
  );
}
