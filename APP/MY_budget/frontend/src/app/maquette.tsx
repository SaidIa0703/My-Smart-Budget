"use client";
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, CreditCard, Target, PiggyBank,
  Bell, Settings, Plus, Home, Receipt, Wallet, User,
  ChevronRight, X, Check, AlertCircle, ArrowUpRight,
  ArrowDownRight, Filter, Search, Eye, EyeOff, Menu, Trash2, LogOut, Lock, Mail, UserPlus
} from 'lucide-react';
import Questionnaire from './questionnaire';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const MySmartBudget = () => {
  // ─── Auth state ───────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState('login');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // ─── App state ────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);

  // ─── Transactions state ───────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ name: '', category: '', amount: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Check profile ────────────────────────────────────────────────────────
  const checkProfile = async (user) => {
    try {
      const res = await fetch(`${API_URL}/api/profile/${user.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.exists) {
        setUserProfile(data.profile);
        setShowQuestionnaire(false);
      } else {
        setShowQuestionnaire(true);
      }
    } catch {
      setShowQuestionnaire(true);
    }
  };

  // ─── Verify session ───────────────────────────────────────────────────────
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (!token || !user) { setAuthLoading(false); return; }
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.valid) {
          const parsedUser = JSON.parse(user);
          setIsAuthenticated(true);
          setCurrentUser(parsedUser);
          await checkProfile(parsedUser);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setAuthLoading(false);
      }
    };
    verifySession();
  }, []);

  useEffect(() => { setAnimateCards(true); }, [currentPage]);

  // ─── Fetch transactions ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !currentUser || showQuestionnaire) return;
    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      setTransactionError(null);
      try {
        const res = await fetch(`${API_URL}/api/transactions/${currentUser.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch {
        setTransactionError('Impossible de charger les transactions');
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, [isAuthenticated, currentUser, showQuestionnaire]);

  // ─── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.message || 'Erreur de connexion'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      await checkProfile(data.user);
    } catch {
      setAuthError('Erreur réseau, réessayez');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (registerForm.password !== registerForm.confirm) { setAuthError('Les mots de passe ne correspondent pas'); return; }
    if (registerForm.password.length < 6) { setAuthError('Minimum 6 caractères'); return; }
    setAuthSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: registerForm.name, email: registerForm.email, password: registerForm.password })
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.message || 'Erreur inscription'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setShowQuestionnaire(true); // Nouveau compte → questionnaire
    } catch {
      setAuthError('Erreur réseau, réessayez');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setTransactions([]);
    setShowQuestionnaire(false);
    setUserProfile(null);
    setCurrentPage('dashboard');
    setAuthError('');
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', password: '', confirm: '' });
  };

  // ─── Add / Delete transactions ────────────────────────────────────────────
  const addTransaction = async () => {
    if (!newTransaction.name || !newTransaction.category || !newTransaction.amount) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ userId: currentUser?.id, name: newTransaction.name, category: newTransaction.category, amount: parseFloat(newTransaction.amount), date: new Date() })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTransactions(prev => [data, ...prev]);
      setShowAddModal(false);
      setNewTransaction({ name: '', category: '', amount: '' });
    } catch { console.error('Erreur ajout'); } finally { setSubmitting(false); }
  };

  const deleteTransaction = async (id) => {
    try {
      await fetch(`${API_URL}/api/transactions/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch { console.error('Erreur suppression'); }
  };

  const filteredTransactions = transactions.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Static data ──────────────────────────────────────────────────────────
  const categories = [
    { name: 'Alimentation', budget: 400, spent: 285, color: '#FF6B6B', icon: '🛒', percentage: 71 },
    { name: 'Transport', budget: 150, spent: 89, color: '#4ECDC4', icon: '🚗', percentage: 59 },
    { name: 'Loisirs', budget: 200, spent: 178, color: '#45B7D1', icon: '🎮', percentage: 89 },
    { name: 'Abonnements', budget: 60, spent: 45, color: '#96CEB4', icon: '📱', percentage: 75 },
    { name: 'Santé', budget: 100, spent: 25, color: '#FFEAA7', icon: '⚕️', percentage: 25 },
    { name: 'Épargne', budget: 500, spent: 500, color: '#DDA0DD', icon: '💎', percentage: 100 },
  ];

  const goals = [
    { name: "Vacances d'été", target: 3000, current: 1850, deadline: 'Juin 2026', icon: '✈️', color: '#FF6B6B' },
    { name: 'MacBook Pro', target: 2500, current: 890, deadline: 'Déc 2026', icon: '💻', color: '#4ECDC4' },
    { name: "Fond d'urgence", target: 10000, current: 6500, deadline: 'Permanent', icon: '🛡️', color: '#45B7D1' },
    { name: 'Nouvelle voiture', target: 15000, current: 3200, deadline: 'Jan 2027', icon: '🚙', color: '#96CEB4' },
  ];

  const profileBadge = userProfile?.profile_type ? {
    etudiant: { label: 'Étudiant', icon: '🎓' },
    salarie: { label: 'Salarié', icon: '💼' },
    famille: { label: 'Famille', icon: '👨‍👩‍👧' },
  }[userProfile.profile_type] : null;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl mx-auto mb-4 animate-pulse">MSB</div>
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // ─── Auth screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl mx-auto mb-4">MSB</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Smart Budget</h1>
            <p className="text-gray-500 mt-1">Gérez vos finances intelligemment</p>
          </div>

          <div className="bg-gray-100 p-1 rounded-2xl flex mb-6">
            <button onClick={() => { setAuthPage('login'); setAuthError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${authPage === 'login' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Connexion
            </button>
            <button onClick={() => { setAuthPage('register'); setAuthError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${authPage === 'register' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              Inscription
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            {authError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl text-red-600 mb-6 text-sm">
                <AlertCircle size={18} className="shrink-0" /><span>{authError}</span>
              </div>
            )}

            {authPage === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="email" required placeholder="vous@exemple.com" value={loginForm.email}
                      onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type={showLoginPassword ? 'text' : 'password'} required placeholder="••••••••" value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full pl-11 pr-12 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={authSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                  {authSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /> Se connecter</>}
                </button>
              </form>
            )}

            {authPage === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" required placeholder="Jean Dupont" value={registerForm.name}
                      onChange={e => setRegisterForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="email" required placeholder="vous@exemple.com" value={registerForm.email}
                      onChange={e => setRegisterForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type={showRegisterPassword ? 'text' : 'password'} required placeholder="Minimum 6 caractères" value={registerForm.password}
                      onChange={e => setRegisterForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full pl-11 pr-12 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="password" required placeholder="••••••••" value={registerForm.confirm}
                      onChange={e => setRegisterForm(p => ({ ...p, confirm: e.target.value }))}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 transition-all ${registerForm.confirm && registerForm.password !== registerForm.confirm ? 'focus:ring-red-400 ring-2 ring-red-300' : 'focus:ring-indigo-500'}`} />
                  </div>
                  {registerForm.confirm && registerForm.password !== registerForm.confirm && (
                    <p className="text-red-500 text-xs mt-1 ml-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
                <button type="submit" disabled={authSubmitting || (!!registerForm.confirm && registerForm.password !== registerForm.confirm)}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                  {authSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Créer mon compte</>}
                </button>
              </form>
            )}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">Vos données sont sécurisées et chiffrées 🔒</p>
        </div>
      </div>
    );
  }

  // ─── Questionnaire (1ère connexion) ───────────────────────────────────────
  if (showQuestionnaire) {
    return (
      <Questionnaire
        currentUser={currentUser}
        onComplete={(profile) => {
          setUserProfile(profile);
          setShowQuestionnaire(false);
        }}
      />
    );
  }

  // ─── App principale ───────────────────────────────────────────────────────
  const NavItem = ({ icon: Icon, label, page }) => (
    <button onClick={() => { setCurrentPage(page); setMenuOpen(false); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${currentPage === page ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-gray-100'}`}>
      <Icon size={22} className={currentPage === page ? 'animate-pulse' : ''} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const DashboardPage = () => (
    <div className="space-y-6 animate-fadeIn">
      {profileBadge && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-4 text-white flex items-center gap-3 shadow-lg">
          <span className="text-3xl">{profileBadge.icon}</span>
          <div>
            <p className="font-bold">Profil {profileBadge.label}</p>
            <p className="text-indigo-100 text-sm">Le code c'est trop style #404</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Solde Total</p>
              <h2 className="text-4xl font-bold mt-2">{showBalance ? '€4,567.89' : '••••••'}</h2>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4"><TrendingUp size={18} /><span className="text-sm">+12% ce mois</span></div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-between items-start">
            <div><p className="text-emerald-100 text-sm font-medium">Revenus</p><h3 className="text-3xl font-bold mt-2">€2,500</h3></div>
            <div className="p-3 bg-white/20 rounded-2xl"><ArrowUpRight size={24} /></div>
          </div>
          <p className="text-sm mt-4 text-emerald-100">Ce mois</p>
        </div>
        <div className="bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105">
          <div className="flex justify-between items-start">
            <div><p className="text-rose-100 text-sm font-medium">Dépenses</p><h3 className="text-3xl font-bold mt-2">€1,234</h3></div>
            <div className="p-3 bg-white/20 rounded-2xl"><ArrowDownRight size={24} /></div>
          </div>
          <p className="text-sm mt-4 text-rose-100">Ce mois</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Plus, label: 'Ajouter', color: 'from-blue-500 to-cyan-500', action: () => { setCurrentPage('transactions'); setShowAddModal(true); } },
            { icon: Receipt, label: 'Facture', color: 'from-purple-500 to-pink-500', action: () => {} },
            { icon: Target, label: 'Objectif', color: 'from-green-500 to-emerald-500', action: () => setCurrentPage('goals') },
            { icon: CreditCard, label: 'Carte', color: 'from-orange-500 to-red-500', action: () => {} },
          ].map((action, i) => (
            <button key={i} onClick={action.action}
              className={`group relative overflow-hidden bg-gradient-to-br ${action.color} p-4 rounded-2xl text-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3`}>
              <div className="relative z-10"><action.icon size={24} className="mx-auto mb-2" /><span className="text-sm font-medium">{action.label}</span></div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Transactions Récentes</h3>
          <button onClick={() => setCurrentPage('transactions')} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">Voir tout <ChevronRight size={18} /></button>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-4">Aucune transaction</p>
          ) : transactions.slice(0, 3).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{t.icon || '💳'}</div>
                <div><p className="font-semibold text-gray-800">{t.name}</p><p className="text-sm text-gray-500">{t.category}</p></div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{t.amount > 0 ? '+' : ''}€{Math.abs(t.amount).toFixed(2)}</p>
                <p className="text-sm text-gray-500">{t.date ? new Date(t.date).toLocaleDateString('fr-FR') : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TransactionsPage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Rechercher une transaction..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2">
            <Filter size={18} /> Filtrer
          </button>
        </div>
        {loadingTransactions && <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>}
        {transactionError && <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl text-red-600 mb-4"><AlertCircle size={20} /><span>{transactionError}</span></div>}
        {!loadingTransactions && !transactionError && filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Receipt size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune transaction trouvée</p>
            <p className="text-sm mt-1">Ajoutez votre première transaction ci-dessous</p>
          </div>
        )}
        {!loadingTransactions && filteredTransactions.length > 0 && (
          <div className="space-y-3">
            {filteredTransactions.map((t, i) => (
              <div key={t.id} className="group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-transparent hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{t.icon || '💳'}</div>
                  <div><p className="font-bold text-gray-800">{t.name}</p><p className="text-sm text-gray-500">{t.category} • {t.date ? new Date(t.date).toLocaleDateString('fr-FR') : ''}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold text-xl ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{t.amount > 0 ? '+' : ''}€{Math.abs(t.amount).toFixed(2)}</p>
                  <button onClick={() => deleteTransaction(t.id)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-xl text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Nouvelle Transaction</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Nom (ex: Carrefour)" value={newTransaction.name}
                onChange={(e) => setNewTransaction(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              <select value={newTransaction.category} onChange={(e) => setNewTransaction(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                <option value="">Sélectionner une catégorie</option>
                <option value="Alimentation">🛒 Alimentation</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Loisirs">🎮 Loisirs</option>
                <option value="Abonnements">📱 Abonnements</option>
                <option value="Santé">⚕️ Santé</option>
                <option value="Revenus">💰 Revenus</option>
                <option value="Épargne">💎 Épargne</option>
                <option value="Autres">📦 Autres</option>
              </select>
              <div className="relative">
                <input type="number" placeholder="Montant (négatif = dépense)" value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-3 pr-10 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
              </div>
              {newTransaction.amount && (
                <p className={`text-sm font-medium px-3 py-2 rounded-xl ${parseFloat(newTransaction.amount) > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {parseFloat(newTransaction.amount) > 0 ? '✅ Revenu' : '📉 Dépense'} de €{Math.abs(parseFloat(newTransaction.amount) || 0).toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setNewTransaction({ name: '', category: '', amount: '' }); }}
                className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-medium hover:bg-gray-50 transition-colors">Annuler</button>
              <button onClick={addTransaction} disabled={submitting || !newTransaction.name || !newTransaction.category || !newTransaction.amount}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={18} /> Ajouter</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowAddModal(true)}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
        <Plus size={20} /> Nouvelle Transaction
      </button>
    </div>
  );

  const BudgetPage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Budgets par Catégorie</h3>
        <div className="space-y-4">
          {categories.map((category, i) => (
            <div key={i} className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 via-transparent to-gray-50 hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer transform hover:scale-[1.02]"
              onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <div><p className="font-bold text-gray-800">{category.name}</p><p className="text-sm text-gray-500">€{category.spent} / €{category.budget}</p></div>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${category.percentage >= 90 ? 'bg-red-100 text-red-600' : category.percentage >= 70 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{category.percentage}%</div>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000" style={{ width: `${category.percentage}%`, backgroundColor: category.color }} />
              </div>
              {selectedCategory === i && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Dépenses: <span className="font-bold">€{category.spent}</span></p>
                  <p className="text-sm text-gray-600">Restant: <span className="font-bold text-green-600">€{category.budget - category.spent}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
        <h4 className="text-lg font-bold mb-2">💡 Conseil du Jour</h4>
        <p className="text-indigo-100">Votre catégorie "Loisirs" approche de sa limite. Pensez à ajuster vos dépenses pour rester dans votre budget!</p>
      </div>
    </div>
  );

  const GoalsPage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{goal.icon}</span>
                <div><h4 className="font-bold text-gray-800">{goal.name}</h4><p className="text-sm text-gray-500">{goal.deadline}</p></div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight size={20} className="text-gray-400" /></button>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progression</span>
                <span className="font-bold" style={{ color: goal.color }}>{Math.round((goal.current / goal.target) * 100)}%</span>
              </div>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000" style={{ width: `${(goal.current / goal.target) * 100}%`, backgroundColor: goal.color }} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div><p className="text-sm text-gray-500">Économisé</p><p className="font-bold text-lg">€{goal.current.toLocaleString()}</p></div>
              <div className="text-right"><p className="text-sm text-gray-500">Objectif</p><p className="font-bold text-lg">€{goal.target.toLocaleString()}</p></div>
            </div>
            <button className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">Ajouter des fonds</button>
          </div>
        ))}
      </div>
      <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
        <Target size={20} /> Créer un Nouvel Objectif
      </button>
    </div>
  );

  const ProfilePage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-2xl">
            {currentUser?.name?.slice(0, 2).toUpperCase() || 'JD'}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{currentUser?.name}</h3>
          <p className="text-gray-500">{currentUser?.email}</p>
          {profileBadge && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl">
              <span>{profileBadge.icon}</span>
              <span className="text-sm font-semibold text-indigo-700">Profil {profileBadge.label}</span>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {[
            { icon: Bell, label: 'Notifications', value: 'Activées' },
            { icon: CreditCard, label: 'Cartes liées', value: '2 cartes' },
            { icon: PiggyBank, label: 'Épargne automatique', value: 'Activée' },
            { icon: Settings, label: 'Paramètres', value: '' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group transform hover:scale-[1.02]">
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
                <span className="font-medium text-gray-800">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm text-gray-500">{item.value}</span>}
                <ChevronRight size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleLogout}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
        <LogOut size={20} /> Déconnexion
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"><Menu size={24} /></button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">MSB</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Smart Budget</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div onClick={() => setCurrentPage('profile')}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'JD'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <aside className={`md:w-64 bg-white rounded-3xl p-6 shadow-xl border border-gray-100 ${menuOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="space-y-2">
            <NavItem icon={Home} label="Tableau de bord" page="dashboard" />
            <NavItem icon={Receipt} label="Transactions" page="transactions" />
            <NavItem icon={Wallet} label="Budget" page="budget" />
            <NavItem icon={Target} label="Objectifs" page="goals" />
            <NavItem icon={User} label="Profil" page="profile" />
          </nav>
          <div className="mt-8 p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
            <h4 className="font-bold text-indigo-900 mb-2">💎 Premium</h4>
            <p className="text-sm text-indigo-700 mb-3">Débloquez toutes les fonctionnalités avancées!</p>
            <button className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">Passer à Pro</button>
          </div>
        </aside>
        <main className="flex-1">
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