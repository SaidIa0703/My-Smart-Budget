'use client';

import Navbar from '@/components/navbar';
import MySmartBudget from '@/components/dashboard';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  return (
    <>
      <Navbar />
      <MySmartBudget />
    </>
  );
}