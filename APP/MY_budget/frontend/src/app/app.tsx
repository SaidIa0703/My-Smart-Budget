import React from 'react';
import Dashboard from '../../components/Dashboard';
import AddTransaction from '../../components/AddTransaction';
import TransactionHistory from '../../components/TransactionHistory';
import BudgetCategories from '../../components/BudgetCategories';
import Reports from '../../components/Reports';
import SavingsGoals from '../../components/SavingsGoals';
import Navbar from '../../components/Navbar';
export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 animate-slideDown">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            💎 BudgetFlow
          </h1>
          <p className="text-xl text-slate-400 font-light">
            Interface moderne et intuitive pour gérer votre budget avec style
          </p>
        </div>

        {/* Mockups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Dashboard />
          <AddTransaction />
          <TransactionHistory />
          <BudgetCategories />
          <Reports />
          <SavingsGoals />
          <Navbar />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-slideDown) {
          animation: slideDown 0.6s ease;
        }

        :global(.animate-fadeInUp) {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </div>
  );
}
