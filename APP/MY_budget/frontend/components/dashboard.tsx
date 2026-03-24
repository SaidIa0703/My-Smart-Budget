import React from 'react';
import MockupCard from './mockupCard';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  progress: number;
}

const Dashboard: React.FC = () => {
  const stats: StatCard[] = [
    {
      label: '💰 Revenus',
      value: '3,450€',
      icon: '💰',
      progress: 85,
    },
    {
      label: '💸 Dépenses',
      value: '1,890€',
      icon: '💸',
      progress: 55,
    },
    {
      label: '🏦 Épargne',
      value: '1,560€',
      icon: '🏦',
      progress: 65,
    },
    {
      label: '📈 Bilan',
      value: '+45%',
      icon: '📈',
      progress: 75,
    },
  ];

  return (
    <MockupCard title="📊 Dashboard Principal" delay={0.1}>
      <div className="bg-gradient-to-b from-slate-50 to-slate-100 h-full flex flex-col">
        {/* Header */}
        <div className="bg-white px-7 py-8 border-b border-slate-200 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BudgetFlow
            </h2>
            <div className="flex gap-4 items-center">
              <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl transition-all duration-300">
                🔔
              </button>
              <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xl transition-all duration-300">
                ⚙️
              </button>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <p className="text-slate-600 text-base mb-7 font-medium">
            Bonjour, Alice! 👋 Voici un aperçu de votre situation financière
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-5">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                  {stat.value}
                </p>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockupCard>
  );
};

export default Dashboard;
