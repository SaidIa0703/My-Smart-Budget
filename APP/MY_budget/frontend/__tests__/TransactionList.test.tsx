import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TransactionList from '../components/TransactionList';

const mockTransactions = [
  { id: 1, name: 'Carrefour', category: 'Alimentation', amount: -50, date: '2024-01-15T00:00:00.000Z' },
  { id: 2, name: 'Salaire', category: 'Revenus', amount: 2000, date: '2024-01-01T00:00:00.000Z' },
];

beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({ id: 1 }));
  globalThis.fetch = jest.fn();
});

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

describe('TransactionList', () => {
  it('shows loading state initially', () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    render(<TransactionList />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    render(<TransactionList />);
    await waitFor(() => {
      expect(screen.getByText('Aucune transaction')).toBeInTheDocument();
    });
  });

  it('renders transaction list', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
    });
    render(<TransactionList />);
    await waitFor(() => {
      expect(screen.getByText('Carrefour')).toBeInTheDocument();
      expect(screen.getByText('Salaire')).toBeInTheDocument();
      expect(screen.getByText('Alimentation')).toBeInTheDocument();
    });
  });

  it('shows negative amount in red and positive in green', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
    });
    render(<TransactionList />);
    await waitFor(() => {
      const negative = screen.getByText('€-50.00');
      const positive = screen.getByText('+€2000.00');
      expect(negative).toHaveClass('text-red-600');
      expect(positive).toHaveClass('text-green-600');
    });
  });

  it('removes transaction after delete', async () => {
    (globalThis.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransactions })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<TransactionList />);
    await waitFor(() => expect(screen.getByText('Carrefour')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Carrefour')).not.toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully (shows empty)', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<TransactionList />);
    await waitFor(() => {
      expect(screen.getByText('Aucune transaction')).toBeInTheDocument();
    });
  });

  it('handles non-ok fetch response', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<TransactionList />);
    await waitFor(() => {
      expect(screen.getByText('Aucune transaction')).toBeInTheDocument();
    });
  });
});
