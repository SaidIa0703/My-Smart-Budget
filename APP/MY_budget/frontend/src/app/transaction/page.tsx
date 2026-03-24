'use client';

import Navbar from '../../../components/Navbar';
import TransactionList from '../../../components/TransactionList';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
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
      <TransactionList />
    </>
  );
}