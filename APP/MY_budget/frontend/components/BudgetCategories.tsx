import React from 'react';
import MockupCard from './MockupCard';

interface Budget {
  id: string;
  name: string;
  current: number;
  total: number;
  status: 'normal' | 'warning' | 'danger';
  emoji: string;
}

const BudgetCategories: React.FC = () => {
  const budgets: Budget[] = [
    {
      id: 'food',
      name: '🍔 Alimentation',
      current: 280,
      total: 350,
      status: 'normal',
      emoji: '🍔',
    },
    {
      id: 'transport',
      name: '🚗 Transport',
      current: 120,
      total: 150,
      status: 'normal',
      emoji: '🚗',
    },
    {
      id: 'entertainment',
      name: '🎬 Loisirs',
      current: 95,
      total: 120,
      status: 'warning',
      emoji: '🎬',
    },
    {
      id: 'housing',
      name: '🏠 Logement',
      current: 1050,
      total: 1000,
      status: 'danger',
      emoji: '🏠',
    },
  ];

  const getProgressColor = (status: string): string => {
    switch (status) {
      case 'normal':
        return 'bg-gradient-to-r from-blue-500 to-purple-600';
      case 'warning':
        return 'bg-gradient-to-r from-amber-400 to-orange-600';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      default:
        return 'bg-slate-300';
    }
  };

  const getCardBgColor = (status: string): string => {
    switch (status) {
      case 'normal':
        return 'bg-slate-50 hover:bg-blue-50';
      case 'warning':
        return 'bg-amber-50 hover:bg-amber-100';
      case 'danger':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return 'bg-slate-50';
    }
  };

  const getPercentage = (current: number, total: number): number => {
    const percent = Math.min((current / total) * 100, 110);
    return percent;
  };

  return (
    <MockupCard title="💰 Budgets par Catégorie" delay={0.4}>
      <div className="bg-white p-8 overflow-y-auto h-full">
        <div className="space-y-5">
          {budgets.map((budget) => {
            const percentage = getPercentage(budget.current, budget.total);
            const remaining = Math.max(budget.total - budget.current, 0);

            return (
              <div
                key={budget.id}
                className={`border-2 border-slate-200 rounded-2xl p-5 transition-all duration-300 cursor-pointer ${getCardBgColor(budget.status)} hover:border-blue-400`}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-900 text-base">
                    {budget.name}
                  </h3>
                  <span className="text-sm text-slate-600 font-medium">
                    {budget.current}€ / {budget.total}€
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getProgressColor(budget.status)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>
                    {budget.status === 'danger'
                      ? '❌ Dépassé!'
                      : budget.status === 'warning'
                        ? '⚠️ ' + Math.round(percentage) + '% utilisé'
                        : '✅ ' + Math.round(percentage) + '% utilisé'}
                  </span>
                  <span>
                    {budget.status === 'danger'
                      ? `-${budget.current - budget.total}€ au-dessus`
                      : `${remaining}€ restant`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MockupCard>
  );
};

export default BudgetCategories;
