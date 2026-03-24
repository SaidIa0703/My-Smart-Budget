import React from 'react';
import MockupCard from '@/components/mockupCard';

interface Goal {
  id: string;
  title: string;
  emoji: string;
  current: number;
  target: number;
  badge: 'En cours' | 'Longue durée' | 'Complété';
  badgeColor: string;
}

const SavingsGoals: React.FC = () => {
  const goals: Goal[] = [
    {
      id: 'vacation',
      title: '✈️ Vacances été',
      emoji: '✈️',
      current: 2400,
      target: 4000,
      badge: 'En cours',
      badgeColor: 'from-emerald-100 to-teal-100',
    },
    {
      id: 'computer',
      title: '💻 Nouvel ordinateur',
      emoji: '💻',
      current: 700,
      target: 2000,
      badge: 'En cours',
      badgeColor: 'from-emerald-100 to-teal-100',
    },
    {
      id: 'apartment',
      title: '🏠 Appart en 2026',
      emoji: '🏠',
      current: 3000,
      target: 20000,
      badge: 'Longue durée',
      badgeColor: 'from-blue-100 to-indigo-100',
    },
  ];

  return (
    <MockupCard title="🎯 Objectifs d'Épargne" delay={0.6}>
      <div className="bg-white p-8 overflow-y-auto h-full">
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Vos objectifs
        </h3>

        <div className="space-y-4">
          {goals.map((goal) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const remaining = goal.target - goal.current;

            return (
              <div
                key={goal.id}
                className="border-2 border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:bg-slate-50 transition-all duration-300 cursor-pointer"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-slate-900 text-base">
                    {goal.title}
                  </h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${goal.badgeColor} text-emerald-700`}>
                    {goal.badge}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Details */}
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span className="text-slate-700">
                    {goal.current.toLocaleString()}€ / {goal.target.toLocaleString()}€
                  </span>
                  <span>
                    {remaining > 0
                      ? `${remaining.toLocaleString()}€ restant`
                      : 'Complété! 🎉'}
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

export default SavingsGoals;
