'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onTransactionAdded?: () => void;
}

export default function AddTransaction({ onTransactionAdded }: Readonly<Props>) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5001/api/transactions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
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
        });
        
        // Appelle le callback sans recharger
        setTimeout(() => {
          if (onTransactionAdded) {
            onTransactionAdded();
          }
        }, 500);
      } else {
        setMessage('Erreur');
      }
    } catch (error) {
      setMessage('Erreur serveur');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Ajouter une Transaction</h2>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.startsWith('Transaction') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
          <input
            id="description"
            type="text"
            placeholder="Ex: Carrefour, Salaire..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">Catégorie</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
            required
          >
            <option value="">Choisir une catégorie</option>
            <option value="Alimentation">🛒 Alimentation</option>
            <option value="Transport">🚗 Transport</option>
            <option value="Loisirs">🎮 Loisirs</option>
            <option value="Abonnements">📱 Abonnements</option>
            <option value="Santé">⚕️ Santé</option>
            <option value="Revenus">💰 Revenus</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">Montant (€)</label>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2">Date</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus size={20} />
          {loading ? 'Chargement...' : 'Ajouter la Transaction'}
        </button>
      </form>
    </div>
  );
}