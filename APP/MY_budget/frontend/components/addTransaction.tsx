'use client';

import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onTransactionAdded?: () => void;
}

export default function AddTransaction({ onTransactionAdded }: Readonly<Props>) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const data = new FormData(e.currentTarget);
    const payload = {
      name: data.get('name') as string,
      category: data.get('category') as string,
      amount: parseFloat(data.get('amount') as string),
      date: data.get('date') as string,
    };

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token') || '';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      const response = await fetch(`${API_URL}/api/transactions/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage('Transaction ajoutée!');
        formRef.current?.reset();

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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
          <input
            id="description"
            name="name"
            type="text"
            placeholder="Ex: Carrefour, Salaire..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">Catégorie</label>
          <select
            id="category"
            name="category"
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
              name="amount"
              type="number"
              placeholder="0.00"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={today}
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
