'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, CartesianGrid, XAxis, YAxis, Bar,
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#A8E6CF'];

interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
}

const getToken = () =>
  sessionStorage.getItem('token') || localStorage.getItem('token') || '';

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setTransactions(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const revenus = transactions
    .filter(t => Number(t.amount) > 0)
    .reduce((s, t) => s + Number(t.amount), 0);

  const depenses = Math.abs(
    transactions.filter(t => Number(t.amount) < 0)
      .reduce((s, t) => s + Number(t.amount), 0)
  );

  const solde = revenus - depenses;

  const categoryData = (() => {
    const cats: Record<string, number> = {};
    transactions
      .filter(t => Number(t.amount) < 0)
      .forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + Math.abs(Number(t.amount));
      });
    return Object.entries(cats).map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: COLORS[i % COLORS.length],
    }));
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Revenus</p>
              <h2 className="text-3xl font-bold mt-2">+{revenus.toFixed(2)} €</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><ArrowUpRight size={24} /></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-400 to-orange-400 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium">Dépenses</p>
              <h2 className="text-3xl font-bold mt-2">-{depenses.toFixed(2)} €</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><ArrowDownRight size={24} /></div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${solde >= 0 ? 'from-indigo-500 to-purple-500' : 'from-red-500 to-pink-500'} rounded-2xl p-6 text-white shadow-xl`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Solde</p>
              <h2 className="text-3xl font-bold mt-2">
                {solde >= 0 ? '+' : ''}{solde.toFixed(2)} €
              </h2>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><TrendingUp size={24} /></div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Répartition des dépenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}€`}
                  labelLine={false}
                >
                  {categoryData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} €`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Dépenses par catégorie</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(v: number) => `${v} €`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3 dernières transactions */}
      <div className="bg-white rounded-2xl p-6 shadow border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Transactions récentes</h3>
          <button
            onClick={() => router.push('/transaction')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Voir tout →
          </button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 3).map(t => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-medium text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-500">
                  {t.category} · {new Date(t.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <p className={`font-bold ${Number(t.amount) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Number(t.amount) > 0 ? '+' : ''}{Number(t.amount).toFixed(2)} €
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-slate-400 py-6">
              Aucune transaction — ajoutez-en une depuis la page Transactions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
