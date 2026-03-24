import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navbar from '@/components/navbar';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: mockPush }),
}));

afterEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
});

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });

  it('highlights the active link', () => {
    render(<Navbar />);
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveClass('font-semibold');
  });

  it('shows login link when no user is logged in', async () => {
    render(<Navbar />);
    await waitFor(() => {
      const loginLinks = screen.getAllByText('Connexion');
      expect(loginLinks.length).toBeGreaterThan(0);
    });
  });

  it('shows welcome message and logout when user is logged in', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@test.com' }));
    render(<Navbar />);
    await waitFor(() => {
      expect(screen.getAllByText(/Alice/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Déconnexion').length).toBeGreaterThan(0);
  });

  it('calls router.push("/login") on logout', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Alice', email: 'alice@test.com' }));
    render(<Navbar />);
    const logoutButtons = await screen.findAllByText('Déconnexion');
    fireEvent.click(logoutButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('toggles mobile menu', () => {
    render(<Navbar />);
    const menuButton = screen.getByLabelText('Ouvrir le menu');
    fireEvent.click(menuButton);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(1);
  });
});
