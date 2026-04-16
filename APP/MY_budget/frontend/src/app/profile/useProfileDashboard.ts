'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Transaction {
  id: number;
  name: string;
  category: string;
  amount: number;
  date: string;
  is_recurring?: boolean;
}

export function useProfileDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [answers, setAnswers] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
  });
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (!userData) { router.push('/login'); return; }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    const savedAnswers = localStorage.getItem(`questionnaire_answers_${parsedUser.id}`);
    if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
  }, []);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTransactions(await res.json());
    } catch {}
    setLoading(false);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_URL}/transactions/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, amount: Number.parseFloat(formData.amount) }),
      });
      if (res.ok) {
        setMessage('Transaction ajoutée !');
        setFormData({ name: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], is_recurring: false });
        setShowAddForm(false);
        fetchTransactions();
      } else {
        setMessage('Erreur lors de l\'ajout.');
      }
    } catch {
      setMessage('Erreur serveur.');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchTransactions();
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${API_URL}/transactions/${editingTransaction.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: editingTransaction.name,
        category: editingTransaction.category,
        amount: Number.parseFloat(editingTransaction.amount),
        date: editingTransaction.date,
        is_recurring: editingTransaction.is_recurring ?? false,
      }),
    });
    if (res.ok) { setEditingTransaction(null); fetchTransactions(); }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const changeProfile = () => {
    if (user?.id) {
      localStorage.removeItem(`questionnaire_done_${user.id}`);
      localStorage.removeItem(`questionnaire_answers_${user.id}`);
    }
    router.push('/');
  };

  const stats = {
    revenus: transactions.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0),
    depenses: Math.abs(transactions.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Number(t.amount), 0)),
    get solde() { return this.revenus - this.depenses; },
  };

  const categoryData = (() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => Number(t.amount) < 0).forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + Math.abs(Number(t.amount));
    });
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#A8E6CF'];
    return Object.entries(cats).map(([name, spent], i) => ({
      name,
      spent: Math.round(spent * 100) / 100,
      color: colors[i % colors.length],
    }));
  })();

  const filteredTransactions = transactions.filter(t =>
    t.name.toLowerCase().includes(searchText.toLowerCase()) &&
    (!filterCategory || t.category === filterCategory)
  );

  return {
    user, answers, transactions, loading,
    showAddForm, setShowAddForm,
    formData, setFormData,
    editingTransaction, setEditingTransaction,
    searchText, setSearchText,
    filterCategory, setFilterCategory,
    message,
    handleAddTransaction, handleDeleteTransaction, handleEditTransaction,
    logout, changeProfile,
    stats, categoryData, filteredTransactions,
  };
}
