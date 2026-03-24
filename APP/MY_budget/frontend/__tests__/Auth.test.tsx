import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthComponent from '../components/Auth';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../src/app/utils/storage', () => ({
  saveSession: jest.fn(),
}));

beforeEach(() => {
  globalThis.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

const fillAndSubmitLogin = (email: string, pwd: string) => {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: pwd } });
  fireEvent.submit(screen.getByRole('button', { name: /se connecter/i }).closest('form'));
};

describe('AuthComponent', () => {
  it('renders login form by default', () => {
    render(<AuthComponent />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('does not show register-only fields in login mode', () => {
    render(<AuthComponent />);
    expect(screen.queryByLabelText('Nom complet')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Confirmer le mot de passe')).not.toBeInTheDocument();
  });

  it('shows register fields when Inscription tab is clicked', () => {
    render(<AuthComponent />);
    fireEvent.click(screen.getByText('Inscription'));
    expect(screen.getByLabelText('Nom complet')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmer le mot de passe')).toBeInTheDocument();
  });

  it('switches back to login when Connexion tab is clicked', () => {
    render(<AuthComponent />);
    fireEvent.click(screen.getByText('Inscription'));
    fireEvent.click(screen.getByText('Connexion'));
    expect(screen.queryByLabelText('Nom complet')).not.toBeInTheDocument();
  });

  it('shows email validation error', async () => {
    render(<AuthComponent />);
    fillAndSubmitLogin('notvalid', 'abc123');
    await waitFor(() => {
      expect(screen.getByText('Email valide requis')).toBeInTheDocument();
    });
  });

  it('clears email error when field is corrected', async () => {
    render(<AuthComponent />);
    fillAndSubmitLogin('bad', 'abc123');
    await waitFor(() => expect(screen.getByText('Email valide requis')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'fix@test.com' } });
    await waitFor(() => {
      expect(screen.queryByText('Email valide requis')).not.toBeInTheDocument();
    });
  });

  it('shows strength error when password is too short', async () => {
    render(<AuthComponent />);
    fillAndSubmitLogin('test@test.com', '123');
    await waitFor(() => {
      expect(screen.getByText('Au minimum 6 caractères')).toBeInTheDocument();
    });
  });

  it('shows mismatch error in register mode', async () => {
    render(<AuthComponent />);
    fireEvent.click(screen.getByText('Inscription'));
    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@test.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'abc456' } });
    fireEvent.submit(screen.getByRole('button', { name: /s'inscrire/i }).closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    });
  });

  it('shows name error when name is too short in register mode', async () => {
    render(<AuthComponent />);
    fireEvent.click(screen.getByText('Inscription'));
    fireEvent.change(screen.getByLabelText('Nom complet'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@test.com' } });
    fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'abc123' } });
    fireEvent.submit(screen.getByRole('button', { name: /s'inscrire/i }).closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Nom requis (min 2 caractères)')).toBeInTheDocument();
    });
  });

  it('calls saveSession and redirects on successful login', async () => {
    jest.useFakeTimers();
    const { saveSession } = require('../src/app/utils/storage');
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'tok123', user: { id: 1, email: 'test@test.com' } }),
    });
    render(<AuthComponent />);
    fillAndSubmitLogin('test@test.com', 'abc123');
    await waitFor(() => {
      expect(saveSession).toHaveBeenCalledWith('tok123', { id: 1, email: 'test@test.com' });
    });
    jest.advanceTimersByTime(1500);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    jest.useRealTimers();
  });

  it('shows success message on login', async () => {
    jest.useFakeTimers();
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'tok', user: { id: 1 } }),
    });
    render(<AuthComponent />);
    fillAndSubmitLogin('test@test.com', 'abc123');
    await waitFor(() => {
      expect(screen.getByText(/Connexion réussie/i)).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  it('shows error message on failed login', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Identifiants incorrects' }),
    });
    render(<AuthComponent />);
    fillAndSubmitLogin('test@test.com', 'abc123');
    await waitFor(() => {
      expect(screen.getByText('Identifiants incorrects')).toBeInTheDocument();
    });
  });

  it('shows fallback error when API message is missing', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });
    render(<AuthComponent />);
    fillAndSubmitLogin('test@test.com', 'abc123');
    await waitFor(() => {
      expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    });
  });

  it('shows server error on network failure', async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    render(<AuthComponent />);
    fillAndSubmitLogin('test@test.com', 'abc123');
    await waitFor(() => {
      expect(screen.getByText('Erreur serveur. Essayer plus tard.')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    render(<AuthComponent />);
    const input = screen.getByLabelText('Mot de passe') as HTMLInputElement;
    expect(input.type).toBe('password');
    const toggleBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('password');
  });
});
