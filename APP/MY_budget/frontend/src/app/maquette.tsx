'use client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, CreditCard, Target, PiggyBank,
  Bell, Settings, Plus, Home, Receipt, Wallet, User,
  ChevronRight, X, ArrowUpRight,
  ArrowDownRight, Search, Eye, EyeOff, Menu, Trash2
} from 'lucide-react';
import Questionnaire from '@/src/app/questionnaire';

// ─── PAGE D'ACCUEIL PERSONNALISÉE ─────────────────────────────────────────────
const WelcomePage = ({ user, answers, onEnter }) => {
  const firstName = user?.name?.split(' ')[0] || 'toi';

  const tips = [
    answers?.objectifsEpargne?.includes('urgence') && { icon: '🛡️', text: "Commence par un fonds d'urgence de 1 000 €" },
    answers?.objectifsEpargne?.includes('immobilier') && { icon: '🏡', text: "Prépare ton apport immobilier dès maintenant" },
    answers?.profileType === 'etudiant' && { icon: '🎓', text: "Applique la règle 50/30/20 à tes revenus" },
    answers?.dettes?.length > 0 && !answers?.dettes?.includes('aucune') && { icon: '🏦', text: "Priorise le remboursement de tes dettes à taux élevé" },
    { icon: '💡', text: "Suis tes dépenses pendant 30 jours pour identifier les fuites" },
  ].filter(Boolean).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-2xl mx-auto mb-6 animate-bounce">
          {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Bienvenue, {firstName} ! 🎉</h1>
        <p className="text-indigo-300 mb-8">Ton espace budget est prêt. Voici tes premiers conseils personnalisés.</p>
        <div className="space-y-3 mb-8 text-left">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/10">
              <span className="text-2xl">{tip.icon}</span>
              <p className="text-white/80 text-sm">{tip.text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={onEnter}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-indigo-500/30 transform hover:scale-[1.02] transition-all duration-300"
        >
          Accéder à mon dashboard →
        </button>
      </div>
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
const MySmartBudget = () => {
  // ✅ CORRECTION 1 : screen state pour gérer le flux login → questionnaire → welcome → dashboard
  const [screen, setScreen] = useState('loading');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [user, setUser] = useState(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
  });
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [message, setMessage] = useState('');

  // redirect vers /login si pas connecté + vérification questionnaire
  useEffect(() => {
    if (typeof globalThis.window === 'undefined') return;
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      globalThis.location.href = '/login';
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    const questionnaireDoneKey = `questionnaire_done_${parsedUser.id}`;
    const questionnaireDone = localStorage.getItem(questionnaireDoneKey);
    if (questionnaireDone) {
      const savedAnswers = localStorage.getItem(`questionnaire_answers_${parsedUser.id}`);
      if (savedAnswers) setQuestionnaireAnswers(JSON.parse(savedAnswers));
      setScreen('dashboard');
    } else {
      setScreen('questionnaire');
    }
  }, []);

  //  Questionnaire terminé → page d'accueil
  const handleQuestionnaireComplete = (answers: any) => {
    if (user?.id) {
      localStorage.setItem(`questionnaire_done_${user.id}`, 'true');
      localStorage.setItem(`questionnaire_answers_${user.id}`, JSON.stringify(answers));
    }
    setQuestionnaireAnswers(answers);
    setScreen('welcome');
  };

  // Page d'accueil → dashboard
  const handleEnterDashboard = () => setScreen('dashboard');

  //  CHARGER LES TRANSACTIONS
  useEffect(() => {
    if (user && screen === 'dashboard') {
      fetchTransactions();
    }
  }, [user, screen]);

  const fetchTransactions = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setAnimateCards(true);
  }, [currentPage]);

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    globalThis.location.href = '/login';
  };

  // template literal corrigé (backtick au lieu de quote)
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: Number.parseFloat(formData.amount)
        })
      });
      if (response.ok) {
        setMessage('Transaction ajoutée!');
        setFormData({
          name: '',
          category: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          is_recurring: false,
        });
        setShowAddForm(false);
        fetchTransactions();
      } else {
        setMessage('Erreur');
      }
    } catch (error) {
      console.error('Erreur ajout transaction:', error);
      setMessage('Erreur serveur');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingTransaction.name,
          category: editingTransaction.category,
          amount: Number.parseFloat(editingTransaction.amount),
          date: editingTransaction.date,
          is_recurring: editingTransaction.is_recurring ?? false,
        }),
      });
      if (response.ok) {
        setEditingTransaction(null);
        fetchTransactions();
      }
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const calculateStats = () => {
    const revenus = transactions.filter(t => Number(t.amount) > 0).reduce((sum, t) => sum + Number(t.amount), 0);
    const depenses = Math.abs(transactions.filter(t => Number(t.amount) < 0).reduce((sum, t) => sum + Number(t.amount), 0));
    const solde = revenus - depenses;
    return { revenus, depenses, solde };
  };

  const getCategories = () => {
    const categories: any = {};
    transactions.forEach(t => {
      if (t.amount < 0) {
        if (!categories[t.category]) {
          categories[t.category] = 0;
        }
        categories[t.category] += Math.abs(t.amount);
      }
    });
    return Object.keys(categories).map(cat => ({
      name: cat,
      spent: Math.round(categories[cat] * 100) / 100,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Object.keys(categories).indexOf(cat) % 6]
    }));
  };

  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = !filterCategory || t.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const stats = calculateStats();
  const categories = getCategories();

  // ─── ÉCRANS ───────────────────────────────────────────────────────────────

  //  spinner pendant le chargement (évite le flash du dashboard)
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-violet-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (screen === 'questionnaire') {
    return <Questionnaire currentUser={user} onComplete={handleQuestionnaireComplete} />;
  }

  if (screen === 'welcome') {
    return <WelcomePage user={user} answers={questionnaireAnswers} onEnter={handleEnterDashboard} />;
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────────

  const getCategoryIcon = (amount: number, category: string): string => {
    if (amount > 0) return '💰';
    if (category === 'Alimentation') return '🛒';
    if (category === 'Transport') return '🚗';
    if (category === 'Loisirs') return '🎮';
    if (category === 'Abonnements') return '📱';
    if (category === 'Santé') return '⚕️';
    return '💸';
  };

  const NavItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        setMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 w-full ${
        currentPage === page
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={22} className={currentPage === page ? 'animate-pulse' : ''} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const DashboardPage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 ${animateCards ? 'animate-slideInLeft' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Solde Total</p>
              <h2 className="text-4xl font-bold mt-2">
                {showBalance ? `€${stats.solde.toFixed(2)}` : '••••••'}
              </h2>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp size={18} />
            <span className="text-sm">{stats.solde > 0 ? '+' : ''}€{stats.solde.toFixed(2)}</span>
          </div>
        </div>

        <div className={`bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 delay-100 ${animateCards ? 'animate-slideInUp' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Revenus</p>
              <h3 className="text-3xl font-bold mt-2">€{stats.revenus.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 text-emerald-100">Ce mois</p>
        </div>

        {/* "Dépenses" */}
        <div className={`bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 delay-200 ${animateCards ? 'animate-slideInRight' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium">Dépenses</p>
              <h3 className="text-3xl font-bold mt-2">€{stats.depenses.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <ArrowDownRight size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 text-rose-100">Ce mois</p>
        </div>
      </div>

      {/* GRAPHIQUES */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Répartition des dépenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name}: €${props.spent}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="spent"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Dépenses par Catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spent" fill="#8884d8">
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TRANSACTIONS RÉCENTES */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Transactions Récentes</h3>
          <button 
            onClick={() => setCurrentPage('transactions')}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Voir tout <ChevronRight size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 3).map((transaction, i) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:shadow-md transform hover:-translate-x-1 animate-slideInLeft`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">
                  {getCategoryIcon(transaction.amount, transaction.category)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{transaction.name}</p>
                  <p className="text-sm text-violet-500">{transaction.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-sm text-violet-500">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TransactionsPage = () => (
    <div className="space-y-6 animate-fadeIn">
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Ajouter une Transaction</h2>
            <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${message.startsWith('Transaction') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <input
              type="text"
              placeholder="Description"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              required
            >
              <option value="">Catégorie</option>
              <option value="Alimentation">🛒 Alimentation</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Loisirs">🎮 Loisirs</option>
              <option value="Abonnements">📱 Abonnements</option>
              <option value="Santé">⚕️ Santé</option>
              <option value="Prélèvement">🏦 Prélèvement</option>
              <option value="Revenus">💰 Revenus</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Montant (€)"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                step="0.01"
                required
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                required
              />
            </div>
            <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition">
              <input
                type="checkbox"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="w-5 h-5 accent-indigo-600"
              />
              <span className="text-sm font-medium text-indigo-700">🔄 Prélèvement récurrent (mensuel)</span>
            </label>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Ajouter
            </button>
          </form>
        </div>
      )}

      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Modifier la transaction</h2>
              <button onClick={() => setEditingTransaction(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleEditTransaction} className="space-y-4">
              <input
                type="text"
                placeholder="Description"
                value={editingTransaction.name}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                required
              />
              <select
                value={editingTransaction.category}
                onChange={(e) => setEditingTransaction({ ...editingTransaction, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                required
              >
                <option value="">Catégorie</option>
                <option value="Alimentation">🛒 Alimentation</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Loisirs">🎮 Loisirs</option>
                <option value="Abonnements">📱 Abonnements</option>
                <option value="Santé">⚕️ Santé</option>
                <option value="Prélèvement">🏦 Prélèvement</option>
              <option value="Revenus">💰 Revenus</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Montant (€)"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  step="0.01"
                  required
                />
                <input
                  type="date"
                  value={editingTransaction.date?.split('T')[0]}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                  required
                />
              </div>
              <label className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition">
                <input
                  type="checkbox"
                  checked={editingTransaction.is_recurring ?? false}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, is_recurring: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600"
                />
                <span className="text-sm font-medium text-indigo-700">🔄 Prélèvement récurrent (mensuel)</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingTransaction(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-slate-900">
                  Annuler
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-500" size={24} />
            <input
              type="text"
              placeholder="🔍 Rechercher une transaction (nom, catégorie...)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-medium text-black"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg"
              >
                <X size={20} className="text-indigo-600" />
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-900"
            >
              <option value="">📂 Toutes catégories</option>
              <option value="Alimentation">🛒 Alimentation</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Loisirs">🎮 Loisirs</option>
              <option value="Abonnements">📱 Abonnements</option>
              <option value="Santé">⚕️ Santé</option>
              <option value="Prélèvement">🏦 Prélèvement</option>
              <option value="Revenus">💰 Revenus</option>
            </select>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 md:w-auto"
            >
              <Plus size={20} />
              Ajouter Transaction
            </button>
          </div>

          {(searchText || filterCategory) && (
            <div className="p-3 bg-indigo-100 border border-indigo-300 rounded-xl">
              <p className="text-indigo-700 font-medium">
                🔎 {filteredTransactions.length} résultat{filteredTransactions.length === 1 ? '' : 's'} trouvé{filteredTransactions.length === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">⏳</div>
              <p className="text-violet-500 mt-2">Chargement des transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <Search size={48} className="mx-auto text-indigo-400 mb-4" />
              <h3 className="text-xl font-bold text-indigo-900 mb-2">Aucune transaction trouvée</h3>
              <p className="text-indigo-600 mb-4">
                {searchText ? `Aucune transaction ne correspond à "${searchText}"` : 'Ajoute ta première transaction!'}
              </p>
              {(searchText || filterCategory) && (
                <button
                  onClick={() => { setSearchText(''); setFilterCategory(''); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  ✕ Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            filteredTransactions.map((transaction, i) => (
              <div
                key={transaction.id}
                className={`group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-transparent hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] border border-gray-200 hover:border-indigo-300 animate-slideInRight`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-4xl">
                    {getCategoryIcon(transaction.amount, transaction.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-lg">{transaction.name}</p>
                      {transaction.is_recurring && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">🔄 Récurrent</span>
                      )}
                    </div>
                    <p className="text-sm text-violet-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-2xl whitespace-nowrap ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <button
                    onClick={() => setEditingTransaction({ ...transaction, amount: String(transaction.amount) })}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Modifier"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const BudgetPage = () => {
    const categoryBudgets = [
      { name: 'Alimentation', budget: 400, spent: categories.find(c => c.name === 'Alimentation')?.spent || 0, color: '#FF6B6B', icon: '🛒' },
      { name: 'Transport', budget: 150, spent: categories.find(c => c.name === 'Transport')?.spent || 0, color: '#4ECDC4', icon: '🚗' },
      { name: 'Loisirs', budget: 200, spent: categories.find(c => c.name === 'Loisirs')?.spent || 0, color: '#45B7D1', icon: '🎮' },
    ];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Budgets par Catégorie</h3>
          <div className="space-y-4">
            {categoryBudgets.map((category, i) => {
              const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
              return (
                <div
                  key={i}
                  className={`group p-5 rounded-2xl bg-gradient-to-r from-gray-50 via-transparent to-gray-50 hover:from-indigo-50 hover:to-purple-50 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] animate-slideInUp`}
                  style={{ animationDelay: `${i * 75}ms` }}
                  onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900">{category.name}</p>
                        <p className="text-sm text-violet-500">€{category.spent.toFixed(2)} / €{category.budget}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                      percentage >= 90 ? 'bg-red-100 text-red-600' :
                      percentage >= 70 ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {Math.round(percentage)}%
                    </div>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: category.color,
                        boxShadow: `0 0 10px ${category.color}50`
                      }}
                    />
                  </div>
                  {selectedCategory === i && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-slideDown">
                      <p className="text-sm text-indigo-600">Budget restant: <span className="font-bold text-green-600">€{Math.max(0, category.budget - category.spent).toFixed(2)}</span></p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const GoalsPage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center py-12">
        <Target size={48} className="mx-auto mb-4 text-indigo-600" />
        <h3 className="text-2xl font-bold mb-2">Pas d'objectifs encore</h3>
        <p className="text-indigo-600 mb-6">Crée tes premiers objectifs d'épargne</p>
        <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium">
          + Créer un Objectif
        </button>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-2xl animate-bounce">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{user?.name}</h3>
          <p className="text-violet-500">{user?.email}</p>
        </div>
        <div className="space-y-4">
          {[
            { icon: Bell, label: 'Notifications', value: 'Activées' },
            { icon: CreditCard, label: 'Cartes liées', value: '0' },
            { icon: PiggyBank, label: 'Épargne auto', value: 'Désactivée' },
            { icon: Settings, label: 'Paramètres', value: '' },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group transform hover:scale-[1.02] animate-slideInLeft`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-indigo-600 group-hover:text-indigo-600 transition-colors" />
                <span className="font-medium text-slate-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm text-violet-500">{item.value}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <button 
        onClick={logout}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        Déconnexion
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                MSB
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Smart Budget
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-900">{user?.name || 'User'}</span>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <aside className={`md:w-64 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="space-y-2">
            <NavItem icon={Home} label="Dashboard" page="dashboard" />
            <NavItem icon={Receipt} label="Transactions" page="transactions" />
            <NavItem icon={Wallet} label="Budget" page="budget" />
            <NavItem icon={Target} label="Objectifs" page="goals" />
            <NavItem icon={User} label="Profil" page="profile" />
          </nav>
        </aside>

        <main className="flex-1">
          {currentPage === 'dashboard' && DashboardPage()}
          {currentPage === 'transactions' && TransactionsPage()}
          {currentPage === 'budget' && BudgetPage()}
          {currentPage === 'goals' && GoalsPage()}
          {currentPage === 'profile' && ProfilePage()}
        </main>
      </div>
    </div>
  );
}; 

export default MySmartBudget;