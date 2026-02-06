import React, { useState } from 'react';
import MockupCard from './MockupCard';

interface Category {
  id: string;
  label: string;
  emoji: string;
}

const AddTransaction: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('alimentation');
  const [amount, setAmount] = useState('28,50€');
  const [description, setDescription] = useState('Restaurant Luc');

  const categories: Category[] = [
    { id: 'alimentation', label: '🍔 Alimentation', emoji: '🍔' },
    { id: 'transport', label: '🚗 Transport', emoji: '🚗' },
    { id: 'loisirs', label: '🎬 Loisirs', emoji: '🎬' },
    { id: 'sante', label: '🏥 Santé', emoji: '🏥' },
    { id: 'logement', label: '🏠 Logement', emoji: '🏠' },
    { id: 'education', label: '📚 Éducation', emoji: '📚' },
  ];

  return (
    <MockupCard title="➕ Ajouter une Transaction" delay={0.2}>
      <div className="bg-white p-8 overflow-y-auto h-full">
        <div className="mb-7">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Nouvelle transaction</h3>
          <p className="text-slate-500 text-sm">Remplissez les détails ci-dessous</p>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            💵 Montant
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
            placeholder="0,00€"
          />
        </div>

        {/* Category Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
            📂 Catégorie
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-3 px-2 rounded-2xl text-xs font-semibold transition-all duration-300 text-center ${
                  activeCategory === cat.id
                    ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 text-blue-600'
                    : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            📝 Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
            placeholder="Ex: Courses au supermarché"
          />
        </div>

        {/* Date Input */}
        <div className="mb-7">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            📅 Date
          </label>
          <input
            type="text"
            defaultValue="23 Jan 2025"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
          />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button className="py-3 px-4 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 transition-all duration-300">
            Annuler
          </button>
          <button className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            ➕ Ajouter
          </button>
        </div>
      </div>
    </MockupCard>
  );
};

export default AddTransaction;
