'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Target, Settings, Plus, Home, Receipt,
  Wallet, User, ChevronRight, X, ArrowUpRight, ArrowDownRight,
  Search, Eye, EyeOff, Menu, Trash2, Edit2, Download, FileText, CheckCircle, BarChart2
} from 'lucide-react';
import Questionnaire from './questionnaire';

const API = process.env.NEXT_PUBLIC_API_URL;
const CATEGORIES = ['Alimentation','Transport','Loisirs','Abonnements','Santé','Revenus','Logement','Autres'];
const CAT_ICONS: Record<string,string> = { Alimentation:'🛒',Transport:'🚗',Loisirs:'🎮',Abonnements:'📱',Santé:'⚕️',Revenus:'💰',Logement:'🏠',Autres:'💸' };
const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#F0E68C','#98D8C8'];
const GOAL_ICONS = ['🎯','🏠','✈️','🚗','💍','🎓','💻','🏖️','🛡️','💰'];

// ─── COMPOSANTS STABLES (hors du composant principal) ─────────────────────────

const Modal = ({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md my-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-600"><X size={20}/></button>
      </div>
      {children}
    </div>
  </div>
);

const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white placeholder-gray-400 text-base";
const selectCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white text-base";
const btnPrimary = "w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-base hover:opacity-90 transition-opacity";

// ─── MODAL TRANSACTION ────────────────────────────────────────────────────────
const TxModal = ({ title, form, setForm, onSubmit, onClose }: any) => (
  <Modal title={title} onClose={onClose}>
    <form onSubmit={onSubmit} className="space-y-4">
      <input className={inputCls} type="text" placeholder="Description (ex: Courses Carrefour)" value={form.name}
        onChange={e => setForm((p:any) => ({...p, name: e.target.value}))} required autoFocus />
      <select className={selectCls} value={form.category} onChange={e => setForm((p:any) => ({...p, category: e.target.value}))} required>
        <option value="">Sélectionner une catégorie</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input className={inputCls} type="number" placeholder="Montant €" value={form.amount}
            onChange={e => setForm((p:any) => ({...p, amount: e.target.value}))} step="0.01" required />
          <p className="text-xs text-gray-500 mt-1 ml-1">Négatif = dépense, positif = revenu</p>
        </div>
        <input className={inputCls} type="date" value={form.date}
          onChange={e => setForm((p:any) => ({...p, date: e.target.value}))} required />
      </div>
      <button type="submit" className={btnPrimary}>Enregistrer</button>
    </form>
  </Modal>
);

// ─── MODAL BUDGET ─────────────────────────────────────────────────────────────
const BudgetModal = ({ title, form, setForm, onSubmit, onClose }: any) => (
  <Modal title={title} onClose={onClose}>
    <form onSubmit={onSubmit} className="space-y-4">
      <select className={selectCls} value={form.category} onChange={e => setForm((p:any) => ({...p, category: e.target.value}))} required>
        <option value="">Sélectionner une catégorie</option>
        {CATEGORIES.filter(c => c !== 'Revenus').map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
      </select>
      <input className={inputCls} type="number" placeholder="Limite mensuelle (€)" value={form.limit}
        onChange={e => setForm((p:any) => ({...p, limit: e.target.value}))} step="0.01" required autoFocus />
      <button type="submit" className={btnPrimary}>Enregistrer</button>
    </form>
  </Modal>
);

// ─── MODAL OBJECTIF ───────────────────────────────────────────────────────────
const GoalModal = ({ title, form, setForm, onSubmit, onClose }: any) => (
  <Modal title={title} onClose={onClose}>
    <form onSubmit={onSubmit} className="space-y-4">
      <input className={inputCls} type="text" placeholder="Nom de l'objectif (ex: Voyage Japon)" value={form.name}
        onChange={e => setForm((p:any) => ({...p, name: e.target.value}))} required autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} type="number" placeholder="Objectif €" value={form.target}
          onChange={e => setForm((p:any) => ({...p, target: e.target.value}))} step="0.01" required />
        <input className={inputCls} type="number" placeholder="Déjà épargné €" value={form.current}
          onChange={e => setForm((p:any) => ({...p, current: e.target.value}))} step="0.01" />
      </div>
      <input className={inputCls} type="date" value={form.deadline}
        onChange={e => setForm((p:any) => ({...p, deadline: e.target.value}))} />
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Icône</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_ICONS.map(icon => (
            <button key={icon} type="button" onClick={() => setForm((p:any) => ({...p, icon}))}
              className={`text-2xl p-2 rounded-xl border-2 transition-all ${form.icon === icon ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>
              {icon}
            </button>
          ))}
        </div>
      </div>
      <button type="submit" className={btnPrimary}>Enregistrer</button>
    </form>
  </Modal>
);

// ─── PAGE D'ACCUEIL ───────────────────────────────────────────────────────────
const WelcomePage = ({ user, answers, onEnter }: any) => {
  const firstName = user?.name?.split(' ')[0] || 'toi';
  const tips = [
    answers?.objectifsEpargne?.includes('urgence') && { icon: '🛡️', text: "Commence par un fonds d'urgence de 1 000 €" },
    answers?.profileType === 'etudiant' && { icon: '🎓', text: "Applique la règle 50/30/20 à tes revenus" },
    { icon: '💡', text: "Suis tes dépenses pendant 30 jours pour identifier les fuites" },
  ].filter(Boolean).slice(0, 3) as any[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto mb-6">
          {user?.name?.split(' ').map((n:string) => n[0]).join('') || 'U'}
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Bienvenue, {firstName} ! 🎉</h1>
        <p className="text-indigo-300 mb-8">Ton espace budget est prêt.</p>
        <div className="space-y-3 mb-8 text-left">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10">
              <span className="text-2xl">{tip.icon}</span>
              <p className="text-white/80 text-sm">{tip.text}</p>
            </div>
          ))}
        </div>
        <button onClick={onEnter} className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:scale-[1.02] transition-transform">
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

  const [showAddTx, setShowAddTx] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [txForm, setTxForm] = useState({ name:'', category:'', amount:'', date: new Date().toISOString().split('T')[0] });
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [budgetForm, setBudgetForm] = useState({ category:'', limit:'' });

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({ name:'', target:'', current:'', icon:'🎯', deadline:'' });
  const [reports, setReports] = useState<any[]>([]);

  // ─── INIT ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('user');
    if (!userData) { window.location.href = '/login'; return; }
    const u = JSON.parse(userData);
    setUser(u);
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
      fetchTransactions(); fetchBudgets(); fetchObjectifs(); fetchReports();
    }
  }, [user, screen]);

  // ─── API ─────────────────────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API}/transactions/${user?.id}`);
      if (res.ok) setTransactions(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`${API}/budgets/${user?.id}`, { credentials:'include' });
      if (res.ok) setBudgets(await res.json());
    } catch {}
  };

  const fetchObjectifs = async () => {
    try {
      const res = await fetch(`${API}/objectifs/${user?.id}`, { credentials:'include' });
      if (res.ok) setGoals(await res.json());
    } catch {}
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API}/reports/${user?.id}`, { credentials:'include' });
      if (res.ok) setReports(await res.json());
    } catch {}
  };

  const handleAddTx = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/transactions/add`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId: user?.id, ...txForm, amount: parseFloat(txForm.amount) })
    }).catch(() => null);
    if (res?.ok) { setShowAddTx(false); setTxForm({ name:'', category:'', amount:'', date: new Date().toISOString().split('T')[0] }); fetchTransactions(); }
  }, [txForm, user]);

  const handleEditTx = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/transactions/${editingTx?.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...txForm, amount: parseFloat(txForm.amount) })
    }).catch(() => null);
    if (res?.ok) { setEditingTx(null); fetchTransactions(); }
  }, [txForm, editingTx]);

  const handleDeleteTx = async (id:number) => {
    const res = await fetch(`${API}/transactions/${id}`, { method:'DELETE' }).catch(() => null);
    if (res?.ok) fetchTransactions();
  };

  const handleAddBudget = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/budgets`, {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ user_id: user?.id, category: budgetForm.category, limit: parseFloat(budgetForm.limit) })
    }).catch(() => null);
    if (res?.ok) { setShowAddBudget(false); setBudgetForm({ category:'', limit:'' }); fetchBudgets(); }
  }, [budgetForm, user]);

  const handleEditBudget = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/budgets/${editingBudget?.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ category: budgetForm.category, limit: parseFloat(budgetForm.limit) })
    }).catch(() => null);
    if (res?.ok) { setEditingBudget(null); fetchBudgets(); }
  }, [budgetForm, editingBudget]);

  const handleDeleteBudget = async (id:number) => {
    await fetch(`${API}/budgets/${id}`, { method:'DELETE', credentials:'include' }).catch(() => null);
    fetchBudgets();
  };

  const handleAddGoal = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/objectifs`, {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ user_id: user?.id, name: goalForm.name, icon: goalForm.icon, target: parseFloat(goalForm.target), current_amount: parseFloat(goalForm.current || '0'), deadline: goalForm.deadline || null })
    }).catch(() => null);
    if (res?.ok) { setShowAddGoal(false); setGoalForm({ name:'', target:'', current:'', icon:'🎯', deadline:'' }); fetchObjectifs(); }
  }, [goalForm, user]);

  const handleEditGoal = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/objectifs/${editingGoal?.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, credentials:'include',
      body: JSON.stringify({ name: goalForm.name, icon: goalForm.icon, target: parseFloat(goalForm.target), current_amount: parseFloat(goalForm.current || '0'), deadline: goalForm.deadline || null })
    }).catch(() => null);
    if (res?.ok) { setEditingGoal(null); fetchObjectifs(); }
  }, [goalForm, editingGoal]);

  const handleDeleteGoal = async (id:number) => {
    await fetch(`${API}/objectifs/${id}`, { method:'DELETE', credentials:'include' }).catch(() => null);
    fetchObjectifs();
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  // ─── STATS ───────────────────────────────────────────────────────────────
  const calculateStats = () => {
    const revenus = transactions.filter(t => parseFloat(t.amount) > 0).reduce((s,t) => s + parseFloat(t.amount), 0);
    const depenses = Math.abs(transactions.filter(t => parseFloat(t.amount) < 0).reduce((s,t) => s + parseFloat(t.amount), 0));
    return { revenus, depenses, solde: revenus - depenses };
  };

  const getCategories = () => {
    const cats: Record<string,number> = {};
    transactions.forEach(t => { if (parseFloat(t.amount) < 0) cats[t.category] = (cats[t.category]||0) + Math.abs(parseFloat(t.amount)); });
    return Object.keys(cats).map((name,i) => ({ name, spent: Math.round(cats[name]*100)/100, color: COLORS[i%COLORS.length] }));
  };

  const deleteReport = async (id: string) => {
    await fetch(`${API}/reports/${id}`, { method:'DELETE', credentials:'include' }).catch(()=>null);
    fetchReports();
  };

  const generatePDFHtml = (stats: any, cats: any[], title: string) => {
    const now = new Date();
    return `<html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif;padding:40px;color:#333}
      h1{color:#4f46e5;border-bottom:3px solid #4f46e5;padding-bottom:10px}
      h2{color:#7c3aed;margin-top:30px}
      .stats{display:flex;gap:20px;margin:20px 0}
      .card{flex:1;padding:20px;border-radius:12px;text-align:center}
      table{width:100%;border-collapse:collapse;margin-top:15px}
      th{background:#4f46e5;color:white;padding:10px;text-align:left}
      td{padding:10px;border-bottom:1px solid #e5e7eb}
      .pos{color:#10b981;font-weight:bold}.neg{color:#ef4444;font-weight:bold}
    </style></head><body>
    <h1>📊 ${title}</h1>
    <p>Généré le ${now.toLocaleDateString('fr-FR')} • ${user?.name}</p>
    <div class="stats">
      <div class="card" style="background:#eef2ff"><p style="color:#666;font-size:12px">Solde</p><p style="font-size:24px;font-weight:bold;color:#4f46e5">€${stats.solde.toFixed(2)}</p></div>
      <div class="card" style="background:#ecfdf5"><p style="color:#666;font-size:12px">Revenus</p><p style="font-size:24px;font-weight:bold;color:#10b981">+€${stats.revenus.toFixed(2)}</p></div>
      <div class="card" style="background:#fff1f2"><p style="color:#666;font-size:12px">Dépenses</p><p style="font-size:24px;font-weight:bold;color:#ef4444">-€${stats.depenses.toFixed(2)}</p></div>
    </div>
    <h2>Dépenses par catégorie</h2>
    <table><tr><th>Catégorie</th><th>Montant</th><th>%</th></tr>
    ${cats.map(c=>`<tr><td>${CAT_ICONS[c.name]||'💸'} ${c.name}</td><td class="neg">-€${c.spent.toFixed(2)}</td><td>${stats.depenses>0?Math.round(c.spent/stats.depenses*100):0}%</td></tr>`).join('')}
    </table>
    <h2>Toutes les transactions</h2>
    <table><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Montant</th></tr>
    ${transactions.map(t=>`<tr><td>${new Date(t.date).toLocaleDateString('fr-FR')}</td><td>${t.name}</td><td>${t.category}</td><td class="${parseFloat(t.amount)>0?'pos':'neg'}">${parseFloat(t.amount)>0?'+':''}€${Math.abs(parseFloat(t.amount)).toFixed(2)}</td></tr>`).join('')}
    </table></body></html>`;
  };

  const exportPDF = async () => {
    const now = new Date();
    const month = now.toLocaleDateString('fr-FR', { month:'long', year:'numeric' });
    const stats = calculateStats();
    const cats = getCategories();
    const title = `Résumé Financier — ${month}`;
    const html = generatePDFHtml(stats, cats, title);

    // Sauvegarde dans MongoDB
    await fetch(`${API}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: String(user?.id),
        title,
        description: `Revenus: €${stats.revenus.toFixed(2)} | Dépenses: €${stats.depenses.toFixed(2)} | Solde: €${stats.solde.toFixed(2)}`,
        type: 'monthly',
        data: { stats, categories: cats, transactionCount: transactions.length }
      })
    }).catch(() => null);

    fetchReports();

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const replayReport = (report: any) => {
    const stats = report.data?.stats || { revenus: 0, depenses: 0, solde: 0 };
    const cats = report.data?.categories || [];
    const html = generatePDFHtml(stats, cats, report.title);
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const stats = calculateStats();
  const categories = getCategories();
  const filteredTx = transactions.filter(t =>
    (t.name||'').toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterCategory || t.category === filterCategory)
  );

  // ─── SCREENS ─────────────────────────────────────────────────────────────
  if (screen === 'loading') return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-4 animate-spin">⏳</div><p className="text-gray-600 font-medium">Chargement...</p></div>
    </div>
  );
  if (screen === 'questionnaire') return (
    <Questionnaire currentUser={user} onComplete={(a:any) => { localStorage.setItem('questionnaire_done','true'); localStorage.setItem('questionnaire_answers',JSON.stringify(a)); setQuestionnaireAnswers(a); setScreen('welcome'); }} />
  );
  if (screen === 'welcome') return <WelcomePage user={user} answers={questionnaireAnswers} onEnter={() => setScreen('dashboard')} />;

  const NavItem = ({ icon: Icon, label, page }: any) => (
    <button onClick={() => { setCurrentPage(page); setMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all w-full text-left ${currentPage===page ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'}`}>
      <Icon size={20} className="shrink-0" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">

      {/* MODALS — définis hors des sous-composants pour éviter les re-mounts */}
      {showAddTx && <TxModal title="Ajouter une transaction" form={txForm} setForm={setTxForm} onSubmit={handleAddTx} onClose={() => setShowAddTx(false)} />}
      {editingTx && <TxModal title="Modifier la transaction" form={txForm} setForm={setTxForm} onSubmit={handleEditTx} onClose={() => setEditingTx(null)} />}
      {showAddBudget && <BudgetModal title="Ajouter un budget" form={budgetForm} setForm={setBudgetForm} onSubmit={handleAddBudget} onClose={() => setShowAddBudget(false)} />}
      {editingBudget && <BudgetModal title="Modifier le budget" form={budgetForm} setForm={setBudgetForm} onSubmit={handleEditBudget} onClose={() => setEditingBudget(null)} />}
      {showAddGoal && <GoalModal title="Créer un objectif" form={goalForm} setForm={setGoalForm} onSubmit={handleAddGoal} onClose={() => setShowAddGoal(false)} />}
      {editingGoal && <GoalModal title="Modifier l'objectif" form={goalForm} setForm={setGoalForm} onSubmit={handleEditGoal} onClose={() => setEditingGoal(null)} />}

      {/* HEADER */}
      <header className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu size={24}/></button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shrink-0">MSB</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Smart Budget</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportPDF} className="hidden md:flex items-center gap-2 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 border border-emerald-200">
              <Download size={16}/> PDF
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user?.name ? user.name.split(' ').map((n:string)=>n[0]).join('') : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* SIDEBAR */}
        <aside className={`md:w-56 bg-white rounded-3xl p-5 shadow-xl border border-gray-100 h-fit shrink-0 ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="space-y-1">
            <NavItem icon={Home} label="Dashboard" page="dashboard" />
            <NavItem icon={Receipt} label="Transactions" page="transactions" />
            <NavItem icon={Wallet} label="Budget" page="budget" />
            <NavItem icon={Target} label="Objectifs" page="goals" />
            <NavItem icon={BarChart2} label="Rapports" page="reports" />
            <NavItem icon={User} label="Profil" page="profile" />
          </nav>
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-800 mb-1">📊 Ce mois</p>
            <p className="text-xs text-indigo-600">Solde : <span className={`font-bold ${stats.solde>=0?'text-green-600':'text-red-600'}`}>€{stats.solde.toFixed(2)}</span></p>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* DASHBOARD */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl hover:scale-105 transition-transform">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-indigo-100 text-sm">Solde Total</p>
                    <button onClick={() => setShowBalance(!showBalance)} className="p-1 bg-white/20 rounded-lg">{showBalance ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                  </div>
                  <h2 className="text-3xl font-bold">{showBalance ? `€${stats.solde.toFixed(2)}` : '••••••'}</h2>
                </div>
                <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl p-6 text-white shadow-xl hover:scale-105 transition-transform">
                  <p className="text-emerald-100 text-sm mb-2">Revenus</p>
                  <h3 className="text-3xl font-bold">€{stats.revenus.toFixed(2)}</h3>
                  <div className="flex items-center gap-1 mt-2 text-sm"><ArrowUpRight size={16}/> Ce mois</div>
                </div>
                <div className="bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-6 text-white shadow-xl hover:scale-105 transition-transform">
                  <p className="text-rose-100 text-sm mb-2">Dépenses</p>
                  <h3 className="text-3xl font-bold">€{stats.depenses.toFixed(2)}</h3>
                  <div className="flex items-center gap-1 mt-2 text-sm"><ArrowDownRight size={16}/> Ce mois</div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={exportPDF} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-medium shadow-lg hover:scale-105 transition-transform">
                  <Download size={18}/> Exporter PDF mensuel
                </button>
              </div>
              {categories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Répartition des dépenses</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart><Pie data={categories} cx="50%" cy="50%" outerRadius={90} dataKey="spent" label={(p:any)=>`${p.name}`} labelLine={false}>
                        {categories.map((e,i)=><Cell key={i} fill={e.color}/>)}
                      </Pie><Tooltip/></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Dépenses par catégorie</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={categories}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis/><Tooltip/>
                        <Bar dataKey="spent">{categories.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-bold text-gray-800">Transactions Récentes</h3>
                  <button onClick={()=>setCurrentPage('transactions')} className="text-indigo-600 font-medium text-sm flex items-center gap-1 hover:underline">Voir tout <ChevronRight size={16}/></button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0,5).map(t=>(
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{parseFloat(t.amount)>0?'💰':(CAT_ICONS[t.category]||'💸')}</span>
                        <div><p className="font-semibold text-gray-800 text-sm">{t.name}</p><p className="text-xs text-gray-500">{t.category}</p></div>
                      </div>
                      <p className={`font-bold ${parseFloat(t.amount)>0?'text-green-500':'text-red-500'}`}>
                        {parseFloat(t.amount)>0?'+':''}€{Math.abs(parseFloat(t.amount)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center text-gray-500 py-6">Aucune transaction</p>}
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS */}
          {currentPage === 'transactions' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <div className="flex flex-col gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input type="text" placeholder="Rechercher une transaction..." value={searchText}
                      onChange={e=>setSearchText(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white" />
                  </div>
                  <div className="flex gap-3">
                    <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white">
                      <option value="">Toutes les catégories</option>
                      {CATEGORIES.map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                    </select>
                    <button onClick={()=>{ setTxForm({name:'',category:'',amount:'',date:new Date().toISOString().split('T')[0]}); setShowAddTx(true); }}
                      className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium flex items-center gap-2 hover:scale-105 transition-transform shrink-0">
                      <Plus size={18}/> Ajouter
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {loading ? <p className="text-center py-10 text-gray-500">Chargement...</p>
                  : filteredTx.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl">
                      <Search size={36} className="mx-auto text-gray-300 mb-3"/>
                      <p className="text-gray-500">Aucune transaction trouvée</p>
                    </div>
                  ) : filteredTx.map(t=>(
                    <div key={t.id} className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-100 hover:border-indigo-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl shrink-0">{parseFloat(t.amount)>0?'💰':(CAT_ICONS[t.category]||'💸')}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className={`font-bold text-lg ${parseFloat(t.amount)>0?'text-green-500':'text-red-500'}`}>
                          {parseFloat(t.amount)>0?'+':''}€{Math.abs(parseFloat(t.amount)).toFixed(2)}
                        </p>
                        <button onClick={()=>{ setTxForm({name:t.name,category:t.category,amount:String(t.amount),date:t.date?.split('T')[0]||''}); setEditingTx(t); }}
                          className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16}/></button>
                        <button onClick={()=>handleDeleteTx(t.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BUDGET */}
          {currentPage === 'budget' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Mes Budgets</h3>
                  <button onClick={()=>{ setBudgetForm({category:'',limit:''}); setShowAddBudget(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform">
                    <Plus size={18}/> Ajouter
                  </button>
                </div>
                {budgets.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Wallet size={40} className="mx-auto text-gray-300 mb-3"/>
                    <p className="text-gray-600 mb-4">Aucun budget défini</p>
                    <button onClick={()=>{ setBudgetForm({category:'',limit:''}); setShowAddBudget(true); }}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm">Créer mon premier budget</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgets.map((b,i)=>{
                      const spent = categories.find(c=>c.name===b.category)?.spent||0;
                      const pct = b.limit>0 ? (spent/parseFloat(b.limit))*100 : 0;
                      return (
                        <div key={b.id} className="group p-5 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{CAT_ICONS[b.category]||'💸'}</span>
                              <div>
                                <p className="font-bold text-gray-800">{b.category}</p>
                                <p className="text-sm text-gray-500">€{spent.toFixed(2)} / €{parseFloat(b.limit).toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold px-3 py-1 rounded-full ${pct>=90?'bg-red-100 text-red-600':pct>=70?'bg-orange-100 text-orange-600':'bg-green-100 text-green-600'}`}>
                                {Math.round(pct)}%
                              </span>
                              <button onClick={()=>{ setBudgetForm({category:b.category,limit:String(b.limit)}); setEditingBudget(b); }}
                                className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={16}/></button>
                              <button onClick={()=>handleDeleteBudget(b.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.min(pct,100)}%`,backgroundColor:COLORS[i%COLORS.length]}}/>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Restant: <span className="font-bold text-green-600">€{Math.max(0,parseFloat(b.limit)-spent).toFixed(2)}</span></p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OBJECTIFS */}
          {currentPage === 'goals' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Mes Objectifs d'épargne</h3>
                  <button onClick={()=>{ setGoalForm({name:'',target:'',current:'',icon:'🎯',deadline:''}); setShowAddGoal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-transform">
                    <Plus size={18}/> Créer
                  </button>
                </div>
                {goals.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Target size={48} className="mx-auto mb-4 text-indigo-300"/>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun objectif</h3>
                    <p className="text-gray-500 mb-6">Définis tes objectifs d'épargne pour rester motivé</p>
                    <button onClick={()=>{ setGoalForm({name:'',target:'',current:'',icon:'🎯',deadline:''}); setShowAddGoal(true); }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium">
                      + Créer mon premier objectif
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.map(g=>{
                      const current = parseFloat(g.current_amount??g.current??0);
                      const target = parseFloat(g.target);
                      const pct = target>0 ? Math.min((current/target)*100,100) : 0;
                      const done = pct>=100;
                      return (
                        <div key={g.id} className={`group p-5 rounded-2xl border-2 transition-all ${done?'border-green-300 bg-green-50':'border-gray-100 bg-gray-50 hover:border-indigo-200'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{g.icon}</span>
                              <div>
                                <p className="font-bold text-gray-800">{g.name}</p>
                                {g.deadline && <p className="text-xs text-gray-500">📅 {new Date(g.deadline).toLocaleDateString('fr-FR')}</p>}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={()=>{ setGoalForm({name:g.name,target:String(g.target),current:String(g.current_amount??g.current??0),icon:g.icon,deadline:g.deadline||''}); setEditingGoal(g); }}
                                className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg"><Edit2 size={16}/></button>
                              <button onClick={()=>handleDeleteGoal(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">€{current.toFixed(2)} épargnés</span>
                            <span className="font-bold text-gray-800">€{target.toFixed(2)}</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${done?'bg-green-500':'bg-gradient-to-r from-indigo-500 to-purple-600'}`} style={{width:`${pct}%`}}/>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className={`text-sm font-bold ${done?'text-green-600':'text-indigo-600'}`}>{Math.round(pct)}%</span>
                            {done ? <span className="text-green-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={14}/> Atteint !</span>
                              : <span className="text-xs text-gray-500">Reste €{(target-current).toFixed(2)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RAPPORTS */}
          {currentPage === 'reports' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Mes Rapports PDF</h3>
                  <button onClick={exportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:scale-105 transition-transform">
                    <Download size={18}/> Générer PDF
                  </button>
                </div>
                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300"/>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun rapport</h3>
                    <p className="text-gray-500 mb-6">Génère ton premier rapport mensuel</p>
                    <button onClick={exportPDF}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-medium">
                      Générer maintenant
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map(r => (
                      <div key={r._id} className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-100 hover:border-indigo-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <FileText size={22} className="text-indigo-600"/>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{r.title}</p>
                            <p className="text-sm text-gray-500">{r.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(r.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => replayReport(r)}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                            <Download size={14}/> Télécharger
                          </button>
                          <button onClick={() => deleteReport(r._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFIL */}
          {currentPage === 'profile' && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-2xl">
                    {user?.name ? user.name.split(' ').map((n:string)=>n[0]).join('') : 'U'}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{user?.name}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                <div className="space-y-3">
                  <button onClick={exportPDF} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-100">
                    <div className="flex items-center gap-3"><FileText size={20} className="text-indigo-600"/><span className="font-medium text-gray-800">Exporter rapport PDF</span></div>
                    <Download size={18} className="text-gray-400"/>
                  </button>
                  <button onClick={()=>{ localStorage.removeItem('questionnaire_done'); localStorage.removeItem('questionnaire_answers'); setScreen('questionnaire'); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 transition-all border border-gray-100">
                    <div className="flex items-center gap-3"><Settings size={20} className="text-indigo-600"/><span className="font-medium text-gray-800">Refaire le questionnaire</span></div>
                    <ChevronRight size={18} className="text-gray-400"/>
                  </button>
                </div>
              </div>
              <button onClick={logout} className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold shadow-xl hover:scale-[1.02] transition-transform">
                Déconnexion
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MySmartBudget;
