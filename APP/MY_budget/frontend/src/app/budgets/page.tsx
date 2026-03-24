'use client';

import Navbar from '../../../components/navbar';
import BudgetCategories from '../../../components/budgetCategories';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BudgetsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Mes Antoines</h1>
          <BudgetCategories />
        </div>
      </div>
    </>
  );
}