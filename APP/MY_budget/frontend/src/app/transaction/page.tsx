'use client';

import Navbar from '../../../components/navbar';
import TransactionList from '../../../components/transactionList';
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