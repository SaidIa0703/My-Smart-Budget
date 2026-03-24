import React from 'react';
import MockupCard from '@/components/mockupCard';

interface ReportItem {
  id: string;
  name: string;
  percentage: number;
  color: string;
  emoji: string;
}

const Reports: React.FC = () => {
  const reportItems: ReportItem[] = [
    {
      id: 'food',
      name: 'Alimentation',
      percentage: 35,
      color: 'from-amber-300 to-amber-400',
      emoji: '🍔',
    },
    {
      id: 'transport',
      name: 'Transport',
      percentage: 18,
      color: 'from-blue-400 to-cyan-400',
      emoji: '🚗',
    },
    {
      id: 'entertainment',
      name: 'Loisirs',
      percentage: 15,
      color: 'from-pink-400 to-rose-400',
      emoji: '🎬',
    },
    {
      id: 'other',
      name: 'Autres',
      percentage: 32,
      color: 'from-purple-400 to-violet-400',
      emoji: '📦',
    },
  ];

  // Calculate heights for bars (normalized to 100%)
  const maxValue = 35; // The maximum percentage value
  const barHeights = reportItems.map((item) => (item.percentage / maxValue) * 100);

  return (
    <MockupCard title="📈 Rapports & Statistiques" delay={0.5}>
      <div className="bg-white p-8 overflow-y-auto h-full">
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-6">
          Dépenses par catégorie
        </h3>

        {/* Chart */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-slate-200 p-6 mb-8 h-40">
          <div className="flex items-end justify-around h-full gap-2">
            {barHeights.map((height, index) => (
              <div
                key={reportItems[index].id}
                className={`flex-1 bg-gradient-to-t ${reportItems[index].color} rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer`}
                style={{ height: `${height}%` }}
                title={`${reportItems[index].name}: ${reportItems[index].percentage}%`}
              ></div>
            ))}
          </div>
        </div>

        {/* Report Items */}
        <div className="space-y-1">
          {reportItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-slate-50 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${item.color}`}></div>
                <span className="text-base font-medium text-slate-700">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-900 text-lg">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </MockupCard>
  );
};

export default Reports;
