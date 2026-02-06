"use client";
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, CreditCard, Target, PiggyBank, 
  Bell, Settings, Plus, Home, Receipt, Wallet, User,
  Calendar, ChevronRight, X, Check, AlertCircle, ArrowUpRight,
  ArrowDownRight, Filter, Search, Eye, EyeOff, Menu
} from 'lucide-react';

const MySmartBudget = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setAnimateCards(true);
  }, [currentPage]);

  const mockTransactions = [
    { id: 1, name: 'Carrefour Market', category: 'Alimentation', amount: -45.67, date: '8 Jan', icon: '🛒', trend: 'down' },
    { id: 2, name: 'Salaire', category: 'Revenus', amount: 2500, date: '5 Jan', icon: '💰', trend: 'up' },
    { id: 3, name: 'Netflix', category: 'Abonnements', amount: -15.99, date: '3 Jan', icon: '📺', trend: 'down' },
    { id: 4, name: 'Restaurant Le Bistro', category: 'Sorties', amount: -78.50, date: '2 Jan', icon: '🍽️', trend: 'down' },
    { id: 5, name: 'Remboursement', category: 'Autres', amount: 120, date: '1 Jan', icon: '💸', trend: 'up' },
  ];

  const categories = [
    { name: 'Alimentation', budget: 400, spent: 285, color: '#FF6B6B', icon: '🛒', percentage: 71 },
    { name: 'Transport', budget: 150, spent: 89, color: '#4ECDC4', icon: '🚗', percentage: 59 },
    { name: 'Loisirs', budget: 200, spent: 178, color: '#45B7D1', icon: '🎮', percentage: 89 },
    { name: 'Abonnements', budget: 60, spent: 45, color: '#96CEB4', icon: '📱', percentage: 75 },
    { name: 'Santé', budget: 100, spent: 25, color: '#FFEAA7', icon: '⚕️', percentage: 25 },
    { name: 'Épargne', budget: 500, spent: 500, color: '#DDA0DD', icon: '💎', percentage: 100 },
  ];

  const goals = [
    { name: 'Vacances d\'été', target: 3000, current: 1850, deadline: 'Juin 2026', icon: '✈️', color: '#FF6B6B' },
    { name: 'MacBook Pro', target: 2500, current: 890, deadline: 'Déc 2026', icon: '💻', color: '#4ECDC4' },
    { name: 'Fond d\'urgence', target: 10000, current: 6500, deadline: 'Permanent', icon: '🛡️', color: '#45B7D1' },
    { name: 'Nouvelle voiture', target: 15000, current: 3200, deadline: 'Jan 2027', icon: '🚙', color: '#96CEB4' },
  ];

  const NavItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        setMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
        currentPage === page 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
          : 'hover:bg-gray-100'
      }`}
    >
      <Icon size={22} className={currentPage === page ? 'animate-pulse' : ''} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const DashboardPage = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 ${animateCards ? 'animate-slideInLeft' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Solde Total</p>
              <h2 className="text-4xl font-bold mt-2">
                {showBalance ? '€4,567.89' : '••••••'}
              </h2>
            </div>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp size={18} />
            <span className="text-sm">+12% ce mois</span>
          </div>
        </div>

        <div className={`bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 delay-100 ${animateCards ? 'animate-slideInUp' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Revenus</p>
              <h3 className="text-3xl font-bold mt-2">€2,500</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 text-emerald-100">Ce mois</p>
        </div>

        <div className={`bg-gradient-to-br from-rose-400 to-orange-400 rounded-3xl p-6 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 delay-200 ${animateCards ? 'animate-slideInRight' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium">Dépenses</p>
              <h3 className="text-3xl font-bold mt-2">€1,234</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl">
              <ArrowDownRight size={24} />
            </div>
          </div>
          <p className="text-sm mt-4 text-rose-100">Ce mois</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Actions Rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Plus, label: 'Ajouter', color: 'from-blue-500 to-cyan-500' },
            { icon: Receipt, label: 'Facture', color: 'from-purple-500 to-pink-500' },
            { icon: Target, label: 'Objectif', color: 'from-green-500 to-emerald-500' },
            { icon: CreditCard, label: 'Carte', color: 'from-orange-500 to-red-500' },
          ].map((action, i) => (
            <button
              key={i}
              className={`group relative overflow-hidden bg-gradient-to-br ${action.color} p-4 rounded-2xl text-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3`}
            >
              <div className="relative z-10">
                <action.icon size={24} className="mx-auto mb-2" />
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Transactions Récentes</h3>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            Voir tout <ChevronRight size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {mockTransactions.slice(0, 3).map((transaction, i) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:shadow-md transform hover:-translate-x-1 animate-slideInLeft`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{transaction.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800">{transaction.name}</p>
                  <p className="text-sm text-gray-500">{transaction.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            />
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <Filter size={18} />
            Filtrer
          </button>
        </div>

        <div className="space-y-3">
          {mockTransactions.map((transaction, i) => (
            <div
              key={transaction.id}
              className={`group flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-transparent hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] animate-slideInRight`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{transaction.icon}</div>
                <div>
                  <p className="font-bold text-gray-800">{transaction.name}</p>
                  <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-bold text-xl ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                </p>
                <ChevronRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
        <Plus size={20} />
        Nouvelle Transaction
      </button>
    </div>
  );

  const BudgetPage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Budgets par Catégorie</h3>
        
        <div className="space-y-4">
          {categories.map((category, i) => (
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
                    <p className="font-bold text-gray-800">{category.name}</p>
                    <p className="text-sm text-gray-500">€{category.spent} / €{category.budget}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                  category.percentage >= 90 ? 'bg-red-100 text-red-600' :
                  category.percentage >= 70 ? 'bg-orange-100 text-orange-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {category.percentage}%
                </div>
              </div>
              
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                    boxShadow: `0 0 10px ${category.color}50`
                  }}
                />
              </div>

              {selectedCategory === i && (
                <div className="mt-4 pt-4 border-t border-gray-200 animate-slideDown">
                  <p className="text-sm text-gray-600">Dépenses ce mois: <span className="font-bold">€{category.spent}</span></p>
                  <p className="text-sm text-gray-600">Budget restant: <span className="font-bold text-green-600">€{category.budget - category.spent}</span></p>
                  <button className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
                    Modifier le budget →
                  </button>
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
          <div
            key={i}
            className={`group bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-1 animate-scaleIn`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{goal.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-800">{goal.name}</h4>
                  <p className="text-sm text-gray-500">{goal.deadline}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progression</span>
                <span className="font-bold" style={{ color: goal.color }}>
                  {Math.round((goal.current / goal.target) * 100)}%
                </span>
              </div>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(goal.current / goal.target) * 100}%`,
                    backgroundColor: goal.color,
                    boxShadow: `0 0 15px ${goal.color}50`
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Économisé</p>
                <p className="font-bold text-lg">€{goal.current.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Objectif</p>
                <p className="font-bold text-lg">€{goal.target.toLocaleString()}</p>
              </div>
            </div>

            <button className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Ajouter des fonds
            </button>
          </div>
        ))}
      </div>

      <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
        <Target size={20} />
        Créer un Nouvel Objectif
      </button>
    </div>
  );

  const ProfilePage = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-2xl animate-bounce">
            JD
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Jean Dupont</h3>
          <p className="text-gray-500">jean.dupont@email.com</p>
        </div>

        <div className="space-y-4">
          {[
            { icon: Bell, label: 'Notifications', value: 'Activées' },
            { icon: CreditCard, label: 'Cartes liées', value: '2 cartes' },
            { icon: PiggyBank, label: 'Épargne automatique', value: 'Activée' },
            { icon: Settings, label: 'Paramètres', value: '' },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group transform hover:scale-[1.02] animate-slideInLeft`}
              style={{ animationDelay: `${i * 75}ms` }}
            >
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

      <button className="w-full py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
        Déconnexion
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.5s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .animate-slideInUp { animation: slideInUp 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out; }
      `}</style>

      {/* Header */}
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
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              JD
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
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
            <button className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Passer à Pro
            </button>
          </div>
        </aside>

        {/* Main Content */}
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