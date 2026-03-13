"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <header className="w-full border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="font-bold text-lg">
          Antoine
        </Link>

        {/* Desktop */}
        <div className="hidden gap-4 md:flex items-center">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm ${active ? "font-semibold underline" : "opacity-80 hover:opacity-100"}`}
              >
                {l.label}
              </Link>
            );
          })}

          {/* User Profile - Desktop */}
          <div className="ml-8 pl-8 border-l">
            {user ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span>Bienvenue, <strong>{user.name}</strong>!</span>
                <button 
                  onClick={logout} 
                  style={{ 
                    padding: '8px 16px', 
                    background: 'red', 
                    color: 'white', 
                    border: 'none', 
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
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
          className="md:hidden rounded border px-3 py-2 text-sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Ouvrir le menu"
        >
          Menu
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="mx-auto flex max-w-6xl flex-col p-4 gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-sm ${pathname === l.href ? "font-semibold" : "opacity-80"}`}
              >
                {l.label}
              </Link>
            ))}

            {/* User Profile - Mobile */}
            <div className="border-t pt-4 mt-4">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span>Bienvenue, <strong>{user.name}</strong>!</span>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <button 
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    style={{ 
                      padding: '8px 16px', 
                      background: 'red', 
                      color: 'white', 
                      border: 'none', 
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    Déconnexion
                  </button>
                </div>
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