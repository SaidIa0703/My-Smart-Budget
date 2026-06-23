'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, CreditCard, Target, PiggyBank,
  Bell, Settings, Plus, Home, Receipt, Wallet, User,
  Calendar, ChevronRight, X, Check, AlertCircle, ArrowUpRight,
  ArrowDownRight, Filter, Search, Eye, EyeOff, Menu, Trash2,
  Edit2, Download, FileText, CheckCircle
} from 'lucide-react';
import Questionnaire from './questionnaire';

const API = process.env.NEXT_PUBLIC_API_URL;

const CATEGORIES = ['Alimentation','Transport','Loisirs','Abonnements','Santé','Revenus','Logement','Autres'];
const CAT_ICONS: Record<string,string> = {
  Alimentation:'🛒', Transport:'🚗', Loisirs:'🎮', Abonnements:'📱',
  Santé:'⚕️', Revenus:'💰', Logement:'🏠', Autres:'💸'
};
const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#F0E68C','#98D8C8'];

// ─── PAGE D'ACCUEIL ───────────────────────────────────────────────────────────
const WelcomePage = ({ user, answers, onEnter }) => {
  const firstName = user?.name?.split(' ')[0] || 'toi';
  const tips = [
    answers?.objectifsEpargne?.includes('urgence') && { icon: '🛡️', text: "Commence par un fonds d'urgence de 1 000 €" },
    answers?.objectifsEpargne?.includes('immobilier') && { icon: '🏡', text: "Prépare ton apport immobilier dès maintenant" },
    answers?.profileType === 'etudiant' && { icon: '🎓', text: "Applique la règle 50/30/20 à tes revenus" },
    { icon: '💡', text: "Suis tes dépenses pendant 30 jours pour identifier les fuites" },
  ].filter(Boolean).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto mb-6 animate-bounce">
          {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Bienvenue, {firstName} ! 🎉</h1>
        <p className="text-indigo-300 mb-8">Ton espace budget est prêt.</p>
        <div className="space-y-3 mb-8 text-left">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/10">
              <span className="text-2xl">{tip.icon}</span>
              <p className="text-white/80 text-sm">{tip.text}</p>
            </div>
          ))}
        </div>
        <button onClick={onEnter} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/30 transform hover:scale-[1.02] transition-all duration-300">
          Accéder à mon dashboard →
        </button>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
const MySmartBudget = () => {
  const [screen, setScreen] = useState('loading');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Transactions
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [txForm, setTxForm] = useState({ name: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Budgets
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [budgetForm, setBudgetForm] = useState({ category: '', limit: '' });

  // Objectifs
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', current: '', icon: '🎯', deadline: '' });

  // ─── INIT ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('user');
    if (!userData) { window.location.href = '/login'; return; }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    const done = localStorage.getItem('questionnaire_done');
    if (done) {
      const saved = localStorage.getItem('questionnaire_answers');
      if (saved) setQuestionnaireAnswers(JSON.parse(saved));
      setScreen('dashboard');
    } else {
      setScreen('questionnaire');
    }
  }, []);

  useEffect(() => {
    if (user && screen === 'dashboard') {
      fetchTransactions();
      fetchBudgets();
      fetchObjectifs();
    }
  }, [user, screen]);

  // ─── API ──────────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API}/transactions/${user?.id}`);
      if (res.ok) setTransactions(await res.json());
    } catch {}
    setLoading(false);
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${API}/budgets/${user?.id}`, { credentials: 'include' });
      if (res.ok) setBudgets(await res.json());
    } catch {}
  };

  const fetchObjectifs = async () => {
    try {
      const res = await fetch(`${API}/objectifs/${user?.id}`, { credentials: 'include' });
      if (res.ok) setGoals(await res.json());
    } catch {}
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, ...txForm, amount: parseFloat(txForm.amount) })
      });
      if (res.ok) {
        setTxForm({ name: '', category: '', amount: '', date: new Date().toISOString().split('T')[0] });
        setShowAddForm(false);
        fetchTransactions();
      }
    } catch {}
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txForm, amount: parseFloat(txForm.amount) })
      });
      if (res.ok) { setEditingTransaction(null); fetchTransactions(); }
    } catch {}
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const res = await fetch(`${API}/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTransactions();
    } catch {}
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: user?.id, category: budgetForm.category, limit: parseFloat(budgetForm.limit) })
      });
      if (res.ok) { setBudgetForm({ category: '', limit: '' }); setShowBudgetForm(false); fetchBudgets(); }
    } catch {}
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/budgets/${editingBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category: budgetForm.category, limit: parseFloat(budgetForm.limit) })
      });
      if (res.ok) { setEditingBudget(null); fetchBudgets(); }
    } catch {}
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      await fetch(`${API}/budgets/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchBudgets();
    } catch {}
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/objectifs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: user?.id, name: goalForm.name, icon: goalForm.icon, target: parseFloat(goalForm.target), current_amount: parseFloat(goalForm.current || '0'), deadline: goalForm.deadline || null })
      });
      if (res.ok) { setGoalForm({ name:'', target:'', current:'', icon:'🎯', deadline:'' }); setShowGoalForm(false); fetchObjectifs(); }
    } catch {}
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/objectifs/${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: goalForm.name, icon: goalForm.icon, target: parseFloat(goalForm.target), current_amount: parseFloat(goalForm.current || '0'), deadline: goalForm.deadline || null })
      });
      if (res.ok) { setEditingGoal(null); fetchObjectifs(); }
    } catch {}
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await fetch(`${API}/objectifs/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchObjectifs();
    } catch {}
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  // ─── STATS ────────────────────────────────────────────────────────────────
  const calculateStats = () => {
    const revenus = transactions.filter(t => parseFloat(t.amount) > 0).reduce((s, t) => s + parseFloat(t.amount), 0);
    const depenses = Math.abs(transactions.filter(t => parseFloat(t.amount) < 0).reduce((s, t) => s + parseFloat(t.amount), 0));
    return { revenus, depenses, solde: revenus - depenses };
  };

  const getCategories = () => {
    const cats: Record<string,number> = {};
    transactions.forEach(t => {
      if (parseFloat(t.amount) < 0) cats[t.category] = (cats[t.category] || 0) + Math.abs(parseFloat(t.amount));
    });
    return Object.keys(cats).map((name, i) => ({ name, spent: Math.round(cats[name] * 100) / 100, color: COLORS[i % COLORS.length] }));
  };

  // ─── PDF EXPORT ───────────────────────────────────────────────────────────
  const exportPDF = () => {
    const now = new Date();
    const month = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const stats = calculateStats();
    const cats = getCategories();

    let html = `
      <html><head><meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
        h2 { color: #7c3aed; margin-top: 30px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { flex: 1; padding: 20px; border-radius: 12px; text-align: center; }
        .solde { background: #eef2ff; }
        .revenus { background: #ecfdf5; }
        .depenses { background: #fff1f2; }
        .stat-label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .stat-value { font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #4f46e5; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        tr:hover { background: #f9fafb; }
        .positive { color: #10b981; font-weight: bold; }
        .negative { color: #ef4444; font-weight: bold; }
        footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
      </style></head><body>
      <h1>📊 Résumé Financier — ${month}</h1>
      <p>Généré le ${now.toLocaleDateString('fr-FR')} • ${user?.name}</p>
      <div class="stats">
        <div class="stat-card solde"><div class="stat-label">Solde</div><div class="stat-value" style="color:#4f46e5">€${stats.solde.toFixed(2)}</div></div>
        <div class="stat-card revenus"><div class="stat-label">Revenus</div><div class="stat-value" style="color:#10b981">+€${stats.revenus.toFixed(2)}</div></div>
        <div class="stat-card depenses"><div class="stat-label">Dépenses</div><div class="stat-value" style="color:#ef4444">-€${stats.depenses.toFixed(2)}</div></div>
      </div>
      <h2>Dépenses par catégorie</h2>
      <table><tr><th>Catégorie</th><th>Montant</th><th>% du total</th></tr>
      ${cats.map(c => `<tr><td>${CAT_ICONS[c.name] || '💸'} ${c.name}</td><td class="negative">-€${c.spent.toFixed(2)}</td><td>${stats.depenses > 0 ? Math.round(c.spent / stats.depenses * 100) : 0}%</td></tr>`).join('')}
      </table>
      <h2>Toutes les transactions</h2>
      <table><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Montant</th></tr>
      ${transactions.map(t => `<tr><td>${new Date(t.date).toLocaleDateString('fr-FR')}</td><td>${t.name}</td><td>${t.category}</td><td class="${parseFloat(t.amount) > 0 ? 'positive' : 'negative'}">${parseFloat(t.amount) > 0 ? '+' : ''}€${Math.abs(parseFloat(t.amount)).toFixed(2)}</td></tr>`).join('')}
      </table>
      <footer>My Smart Budget — Rapport mensuel</footer>
      </body></html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const stats = calculateStats();
  const categories = getCategories();
  const filteredTransactions = transactions.filter(t =>
    t.name?.toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterCategory || t.category === filterCategory)
  );

  // ─── SCREENS ──────────────────────────────────────────────────────────────
  if (screen === 'loading') return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center"><div className="inline-block animate-spin text-4xl mb-4">⏳</div><p className="text-gray-500 font-medium">Chargement...</p></div>
    </div>
  );
  if (screen === 'questionnaire') return <Questionnaire currentUser={user} onComplete={(a) => { localStorage.setItem('questionnaire_done','true'); localStorage.setItem('questionnaire_answers',JSON.stringify(a)); setQuestionnaireAnswers(a); setScreen('welcome'); }} />;
  if (screen === 'welcome') return <WelcomePage user={user} answers={questionnaireAnswers} onEnter={() => setScreen('dashboard')} />;

  // ─── NAV ──────────────────────────────────────────────────────────────────
  const NavItem = ({ icon: Icon, label, page }: any) => (
    <button onClick={() => { setCurrentPage(page); setMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 w-full ${currentPage === page ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'}`}>
      <Icon size={22} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // ─── FORM MODAL ───────────────────────────────────────────────────────────
  const Modal = ({ title, onClose, children }: any) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );

  const TxForm = ({ onSubmit, onCancel, title }: any) => (
    <Modal title={title} onClose={onCancel}>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="text" placeholder="Description" value={txForm.name} onChange={e => setTxForm({...txForm, name: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
          <option value="">Catégorie</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Montant (€)" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" step="0.01" required />
          <input type="date" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <p className="text-xs text-gray-500">💡 Montant négatif = dépense, positif = revenu</p>
        <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">Enregistrer</button>
      </form>
    </Modal>
  );

  // ─── DASHBOARD ────────────────────────────────────────────────────────────
  const DashboardPage = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-2xl hover:scale-105 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Solde Total</p>
              <h2 className="text-4xl font-bold mt-2">{showBalance ? `€${stats.solde.toFixed(2)}` : '••••••'}</h2>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-white/20 rounded-xl">
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl p-6 text-white shadow-2xl hover:scale-105 transition-transform">
          <p className="text-emerald-100 text-sm">Revenus</p>
          <h3 className="text-3xl font-bold mt-2">€{stats.revenus.toFixed(2)}</h3>
          <div className="flex items-center gap-1 mt-4"><ArrowUpRight size={18} /><span className="text-sm">Ce mois</span></div>
        </div>
        <div className="bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-6 text-white shadow-2xl hover:scale-105 transition-transform">
          <p className="text-rose-100 text-sm">Dépenses</p>
          <h3 className="text-3xl font-bold mt-2">€{stats.depenses.toFixed(2)}</h3>
          <div className="flex items-center gap-1 mt-4"><ArrowDownRight size={18} /><span className="text-sm">Ce mois</span></div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={exportPDF} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          <Download size={20} /> Exporter PDF mensuel
        </button>
      </div>

      {categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Répartition des dépenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" labelLine={false} label={(p:any) => `${p.name}: €${p.spent}`} outerRadius={90} dataKey="spent">
                  {categories.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Dépenses par catégorie</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize:11}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spent" fill="#8884d8">
                  {categories.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Transactions Récentes</h3>
          <button onClick={() => setCurrentPage('transactions')} className="text-indigo-600 font-medium flex items-center gap-1 hover:underline">
            Voir tout <ChevronRight size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{parseFloat(t.amount) > 0 ? '💰' : (CAT_ICONS[t.category] || '💸')}</span>
                <div>
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.category}</p>
                </div>
              </div>
              <p className={`font-bold text-lg ${parseFloat(t.amount) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {parseFloat(t.amount) > 0 ? '+' : ''}€{Math.abs(parseFloat(t.amount)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── TRANSACTIONS ─────────────────────────────────────────────────────────
  const TransactionsPage = () => (
    <div className="space-y-6">
      {showAddForm && (
        <TxForm title="Ajouter une transaction" onSubmit={handleAddTransaction} onCancel={() => setShowAddForm(false)} />
      )}
      {editingTransaction && (
        <TxForm title="Modifier la transaction" onSubmit={handleEditTransaction} onCancel={() => setEditingTransaction(null)} />
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
            <input type="text" placeholder="Rechercher..." value={searchText} onChange={e => setSearchText(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Toutes catégories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
            <button onClick={() => { setTxForm({ name:'', category:'', amount:'', date: new Date().toISOString().split('T')[0] }); setShowAddForm(true); }}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium flex items-center gap-2 hover:scale-105 transition-transform">
              <Plus size={20} /> Ajouter
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-center py-10 text-gray-500">Chargement...</p>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Search size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Aucune transaction trouvée</p>
            </div>
          ) : filteredTransactions.map(t => (
            <div key={t.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-100 hover:border-indigo-200">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{parseFloat(t.amount) > 0 ? '💰' : (CAT_ICONS[t.category] || '💸')}</span>
                <div>
                  <p className="font-bold text-gray-800">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className={`font-bold text-xl ${parseFloat(t.amount) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(t.amount) > 0 ? '+' : ''}€{Math.abs(parseFloat(t.amount)).toFixed(2)}
                </p>
                <button onClick={() => { setTxForm({ name: t.name, category: t.category, amount: String(t.amount), date: t.date?.split('T')[0] || '' }); setEditingTransaction(t); }}
                  className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDeleteTransaction(t.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── BUDGET ───────────────────────────────────────────────────────────────
  const BudgetPage = () => (
    <div className="space-y-6">
      {showBudgetForm && (
        <Modal title="Ajouter un budget" onClose={() => setShowBudgetForm(false)}>
          <form onSubmit={handleAddBudget} className="space-y-4">
            <select value={budgetForm.category} onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
              <option value="">Catégorie</option>
              {CATEGORIES.filter(c => c !== 'Revenus').map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
            <input type="number" placeholder="Limite mensuelle (€)" value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" step="0.01" required />
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">Créer</button>
          </form>
        </Modal>
      )}
      {editingBudget && (
        <Modal title="Modifier le budget" onClose={() => setEditingBudget(null)}>
          <form onSubmit={handleEditBudget} className="space-y-4">
            <select value={budgetForm.category} onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
              {CATEGORIES.filter(c => c !== 'Revenus').map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
            <input type="number" value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" step="0.01" required />
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">Sauvegarder</button>
          </form>
        </Modal>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Mes Budgets</h3>
          <button onClick={() => { setBudgetForm({ category:'', limit:'' }); setShowBudgetForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform">
            <Plus size={18} /> Ajouter
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Wallet size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Aucun budget défini</p>
            <button onClick={() => { setBudgetForm({ category:'', limit:'' }); setShowBudgetForm(true); }}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl">Créer mon premier budget</button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((b, i) => {
              const spent = categories.find(c => c.name === b.category)?.spent || 0;
              const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
              return (
                <div key={b.id} className="group p-5 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{CAT_ICONS[b.category] || '💸'}</span>
                      <div>
                        <p className="font-bold text-gray-800">{b.category}</p>
                        <p className="text-sm text-gray-500">€{spent.toFixed(2)} / €{parseFloat(b.limit).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${pct >= 90 ? 'bg-red-100 text-red-600' : pct >= 70 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {Math.round(pct)}%
                      </span>
                      <button onClick={() => { setBudgetForm({ category: b.category, limit: String(b.limit) }); setEditingBudget(b); }}
                        className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteBudget(b.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Restant: <span className="font-bold text-green-600">€{Math.max(0, parseFloat(b.limit) - spent).toFixed(2)}</span></p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ─── OBJECTIFS ────────────────────────────────────────────────────────────
  const GOAL_ICONS = ['🎯','🏠','✈️','🚗','💍','🎓','💻','🏖️','🛡️','💰'];

  const GoalsPage = () => (
    <div className="space-y-6">
      {showGoalForm && (
        <Modal title="Créer un objectif" onClose={() => setShowGoalForm(false)}>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <input type="text" placeholder="Nom de l'objectif" value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Objectif (€)" value={goalForm.target} onChange={e => setGoalForm({...goalForm, target: e.target.value})}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" step="0.01" required />
              <input type="number" placeholder="Épargné (€)" value={goalForm.current} onChange={e => setGoalForm({...goalForm, current: e.target.value})}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" step="0.01" />
            </div>
            <input type="date" placeholder="Date cible" value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div>
              <p className="text-sm text-gray-600 mb-2">Icône</p>
              <div className="flex flex-wrap gap-2">
                {GOAL_ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setGoalForm({...goalForm, icon})}
                    className={`text-2xl p-2 rounded-xl border-2 transition-all ${goalForm.icon === icon ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>{icon}</button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">Créer</button>
          </form>
        </Modal>
      )}
      {editingGoal && (
        <Modal title="Modifier l'objectif" onClose={() => setEditingGoal(null)}>
          <form onSubmit={handleEditGoal} className="space-y-4">
            <input type="text" value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={goalForm.target} onChange={e => setGoalForm({...goalForm, target: e.target.value})}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" step="0.01" required />
              <input type="number" value={goalForm.current} onChange={e => setGoalForm({...goalForm, current: e.target.value})}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" step="0.01" />
            </div>
            <input type="date" value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">Sauvegarder</button>
          </form>
        </Modal>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Mes Objectifs d'épargne</h3>
          <button onClick={() => { setGoalForm({ name:'', target:'', current:'', icon:'🎯', deadline:'' }); setShowGoalForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform">
            <Plus size={18} /> Créer
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Target size={48} className="mx-auto mb-4 text-indigo-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun objectif</h3>
            <p className="text-gray-500 mb-6">Définis tes objectifs d'épargne pour rester motivé</p>
            <button onClick={() => { setGoalForm({ name:'', target:'', current:'', icon:'🎯', deadline:'' }); setShowGoalForm(true); }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium">
              + Créer mon premier objectif
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(g => {
              const current = parseFloat(g.current_amount ?? g.current ?? 0);
              const pct = g.target > 0 ? Math.min((current / parseFloat(g.target)) * 100, 100) : 0;
              const done = pct >= 100;
              return (
                <div key={g.id} className={`group p-5 rounded-2xl border-2 transition-all ${done ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50 hover:border-indigo-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{g.icon}</span>
                      <div>
                        <p className="font-bold text-gray-800">{g.name}</p>
                        {g.deadline && <p className="text-xs text-gray-500">📅 {new Date(g.deadline).toLocaleDateString('fr-FR')}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setGoalForm({ name: g.name, target: String(g.target), current: String(g.current_amount ?? g.current ?? 0), icon: g.icon, deadline: g.deadline || '' }); setEditingGoal(g); }}
                        className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteGoal(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">€{current.toFixed(2)} épargnés</span>
                    <span className="font-bold text-gray-800">€{parseFloat(g.target).toFixed(2)}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm font-bold ${done ? 'text-green-600' : 'text-indigo-600'}`}>{Math.round(pct)}%</span>
                    {done ? <span className="text-green-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={16} /> Objectif atteint !</span>
                      : <span className="text-sm text-gray-500">Reste €{(parseFloat(g.target) - current).toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ─── PROFIL ───────────────────────────────────────────────────────────────
  const ProfilePage = () => {
    const [notif, setNotif] = useState(localStorage.getItem('notif') !== 'off');
    const [epargne, setEpargne] = useState(localStorage.getItem('epargne') === 'on');

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-2xl">
              {user?.name ? user.name.split(' ').map((n:string) => n[0]).join('') : 'U'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{user?.name}</h3>
            <p className="text-gray-500">{user?.email}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-indigo-600" />
                <span className="font-medium text-gray-800">Notifications</span>
              </div>
              <button onClick={() => { const v = !notif; setNotif(v); localStorage.setItem('notif', v ? 'on' : 'off'); }}
                className={`w-12 h-6 rounded-full transition-colors relative ${notif ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notif ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3">
                <PiggyBank size={20} className="text-indigo-600" />
                <span className="font-medium text-gray-800">Épargne automatique</span>
              </div>
              <button onClick={() => { const v = !epargne; setEpargne(v); localStorage.setItem('epargne', v ? 'on' : 'off'); }}
                className={`w-12 h-6 rounded-full transition-colors relative ${epargne ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${epargne ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <button onClick={exportPDF} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-indigo-600" />
                <span className="font-medium text-gray-800">Exporter rapport PDF</span>
              </div>
              <Download size={18} className="text-gray-400" />
            </button>

            <button onClick={() => { localStorage.removeItem('questionnaire_done'); localStorage.removeItem('questionnaire_answers'); setScreen('questionnaire'); }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-indigo-600" />
                <span className="font-medium text-gray-800">Refaire le questionnaire</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        <button onClick={logout} className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold shadow-xl hover:scale-[1.02] transition-transform">
          Déconnexion
        </button>
      </div>
    );
  };

  // ─── LAYOUT ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu size={24} /></button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">MSB</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Smart Budget</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportPDF} className="hidden md:flex items-center gap-2 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200">
              <Download size={16} /> PDF
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {user?.name ? user.name.split(' ').map((n:string) => n[0]).join('') : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <aside className={`md:w-64 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-fit ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="space-y-2">
            <NavItem icon={Home} label="Dashboard" page="dashboard" />
            <NavItem icon={Receipt} label="Transactions" page="transactions" />
            <NavItem icon={Wallet} label="Budget" page="budget" />
            <NavItem icon={Target} label="Objectifs" page="goals" />
            <NavItem icon={User} label="Profil" page="profile" />
          </nav>
          <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <p className="text-sm font-semibold text-indigo-800 mb-1">📊 Ce mois</p>
            <p className="text-xs text-indigo-600">Solde : <span className={`font-bold ${stats.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{stats.solde.toFixed(2)}</span></p>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'transactions' && <TransactionsPage />}
          {currentPage === 'budget' && <BudgetPage />}
          {currentPage === 'goals' && <GoalsPage />}
          {currentPage === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
};

export default MySmartBudget;
