import React from 'react';
import MockupCard from './MockupCard';

interface Transaction {
  id: number;
  name: string;
  date: string;
  amount: string;
  category: 'food' | 'transport' | 'entertainment';
  emoji: string;
}

const TransactionHistory: React.FC = () => {
  const transactions: Transaction[] = [
    {
      id: 1,
      name: 'Restaurant Luc',
      date: '22 Jan à 19:30',
      amount: '-28,50€',
      category: 'food',
      emoji: '🍔',
    },
    {
      id: 2,
      name: 'Uber',
      date: '22 Jan à 18:00',
      amount: '-12,80€',
      category: 'transport',
      emoji: '🚕',
    },
    {
      id: 3,
      name: 'Netflix',
      date: '1 Jan',
      amount: '-15,99€',
      category: 'entertainment',
      emoji: '🎬',
    },
    {
      id: 4,
      name: 'Monoprix',
      date: '20 Jan à 16:45',
      amount: '-45,23€',
      category: 'food',
      emoji: '🛒',
    },
    {
      id: 5,
      name: 'Café du matin',
      date: '19 Jan à 08:15',
      amount: '-4,50€',
      category: 'food',
      emoji: '☕',
    },
  ];

  const getCategoryBgColor = (category: string): string => {
    switch (category) {
      case 'food':
        return 'bg-gradient-to-br from-amber-100 to-orange-100';
      case 'transport':
        return 'bg-gradient-to-br from-blue-100 to-cyan-100';
      case 'entertainment':
        return 'bg-gradient-to-br from-pink-100 to-rose-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <MockupCard title="📝 Historique des Transactions" delay={0.3}>
      <div className="bg-white h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold tracking-tight">Janvier 2025</h2>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className={`flex items-center px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors duration-300 cursor-pointer ${
                index === transactions.length - 1 ? 'border-b-0' : ''
              }`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${getCategoryBgColor(tx.category)}`}>
                {tx.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 ml-3 min-w-0">
                <p className="font-semibold text-slate-900 text-base truncate">
                  {tx.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {tx.date}
                </p>
              </div>

              {/* Amount */}
              <div className="font-bold text-red-500 text-base ml-3 flex-shrink-0">
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupCard>
  );
};

export default TransactionHistory;
