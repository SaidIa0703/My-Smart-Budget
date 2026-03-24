import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}));

jest.mock('../components/navbar', () => () => <nav>Navbar</nav>);
jest.mock('../components/dashboard', () => () => <div>Dashboard</div>);
jest.mock('../components/savingsGoals', () => () => <div>SavingsGoals</div>);
jest.mock('../components/transactionList', () => () => <div>TransactionList</div>);

import DashboardPage from '../src/app/dashboard/page';
import GoalsPage from '../src/app/goals/page';

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

// ─── Dashboard page ───────────────────────────────────────────────────────────

describe('DashboardPage', () => {
  it('renders dashboard when token is present', () => {
    localStorage.setItem('token', 'valid-token');
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects to login when no token', async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});

// ─── Goals page ───────────────────────────────────────────────────────────────

describe('GoalsPage', () => {
  it('renders goals page when token is present', () => {
    localStorage.setItem('token', 'valid-token');
    render(<GoalsPage />);
    expect(screen.getByText("Mes Objectifs d'Épargne")).toBeInTheDocument();
  });

  it('redirects to login when no token', async () => {
    render(<GoalsPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
