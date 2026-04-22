"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const links = [
  { href: "/", label: "Accueil" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/goals", label: "Objectifs" },
  { href: "/reports", label: "Rapports" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [exceededCount, setExceededCount] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (raw) {
      setUser(JSON.parse(raw));
    }
  }, []);

  // Charge le nombre de budgets dépassés pour afficher le badge d'alerte
  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_URL}/api/budgets`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((budgets: { limit: number; current_spending: number }[]) => {
        const count = budgets.filter(b => Number(b.current_spending) >= Number(b.limit)).length;
        setExceededCount(count);
      })
      .catch(() => {});
  }, [pathname]); // Recharge à chaque changement de page

  const logout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push('/login');
  };

  return (
    <header className="w-full border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">
          MySmartBudget
        </Link>

        {/* Desktop */}
        <div className="hidden gap-4 md:flex items-center">
          {links.map((l) => {
            const active = pathname === l.href;
            const isBudgets = l.href === '/budgets';
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative text-sm ${active ? "font-semibold underline" : "opacity-80 hover:opacity-100"}`}
              >
                {l.label}
                {isBudgets && exceededCount > 0 && (
                  <span className="absolute -top-2 -right-3 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {exceededCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* User + déconnexion */}
          <div className="ml-8 pl-8 border-l flex items-center gap-3">
            {exceededCount > 0 && (
              <Link href="/budgets" title={`${exceededCount} budget(s) dépassé(s)`} className="relative">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {exceededCount}
                </span>
              </Link>
            )}
            {user ? (
              <div className="flex gap-3 items-center">
                <span className="text-sm">Bonjour, <strong>{user.name}</strong></span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-semibold hover:opacity-80">
                Connexion
              </Link>
            )}
          </div>
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden rounded border px-3 py-2 text-sm relative"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Ouvrir le menu"
        >
          Menu
          {exceededCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {exceededCount}
            </span>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto flex max-w-6xl flex-col p-4 gap-3">
            {links.map((l) => {
              const isBudgets = l.href === '/budgets';
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`relative text-sm w-fit ${pathname === l.href ? "font-semibold" : "opacity-80"}`}
                >
                  {l.label}
                  {isBudgets && exceededCount > 0 && (
                    <span className="absolute -top-2 -right-3 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {exceededCount}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="border-t pt-4 mt-2 flex flex-col gap-3">
              {user ? (
                <>
                  <span className="text-sm">Bonjour, <strong>{user.name}</strong></span>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition w-full"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-sm font-semibold">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
