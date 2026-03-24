import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddTransaction from '../components/addTransaction';

beforeEach(() => {
  localStorage.setItem('user', JSON.stringify({ id: 1 }));
  globalThis.fetch = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  jest.useRealTimers();
});

describe('AddTransaction', () => {
  it('renders the form', () => {
    render(<AddTransaction />);
    expect(screen.getByText('Ajouter une Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Catégorie')).toBeInTheDocument();
    expect(screen.getByLabelText('Montant (€)')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('shows success message on submit', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    render(<AddTransaction />);
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Carrefour' } });
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'Alimentation' } });
    fireEvent.change(screen.getByLabelText('Montant (€)'), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter la transaction/i }));
    await waitFor(() => {
      expect(screen.getByText(/Transaction ajoutée/i)).toBeInTheDocument();
    });
  });

  it('resets form after successful submit', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    render(<AddTransaction />);
    const descInput = screen.getByLabelText('Description');
    fireEvent.change(descInput, { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'Alimentation' } });
    fireEvent.change(screen.getByLabelText('Montant (€)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter la transaction/i }));
    await waitFor(() => {
      expect((descInput as HTMLInputElement).value).toBe('');
    });
  });

  it('calls onTransactionAdded callback after delay', async () => {
    const onAdded = jest.fn();
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    });
    render(<AddTransaction onTransactionAdded={onAdded} />);
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'Alimentation' } });
    fireEvent.change(screen.getByLabelText('Montant (€)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter la transaction/i }));
    await waitFor(() => expect(screen.getByText(/Transaction ajoutée/i)).toBeInTheDocument());
    jest.advanceTimersByTime(500);
    expect(onAdded).toHaveBeenCalled();
  });

  it('shows error message on failed submit', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<AddTransaction />);
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'Alimentation' } });
    fireEvent.change(screen.getByLabelText('Montant (€)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter la transaction/i }));
    await waitFor(() => {
      expect(screen.getByText('Erreur')).toBeInTheDocument();
    });
  });

  it('shows server error on network failure', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<AddTransaction />);
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'Alimentation' } });
    fireEvent.change(screen.getByLabelText('Montant (€)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter la transaction/i }));
    await waitFor(() => {
      expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
    });
  });
});
