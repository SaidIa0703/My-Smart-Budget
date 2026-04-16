'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/src/app/utils/storage';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

      const body = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Une erreur est survenue');
        return;
      }

      saveSession(data.token, data.user);
      router.push('/');

    } catch (err: unknown) {
      console.error('Login error:', err);
      setError('Erreur serveur — vérifie ta connexion');
    } finally {
      setLoading(false);
    }
  };

  const modeLabel = mode === 'login' ? 'Se connecter' : "S'inscrire";
  const submitLabel = loading ? 'Chargement...' : modeLabel;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded mb-3">
            <span className="text-white text-2xl">💰</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700">My Smart Budget</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {mode === 'login' ? 'Connecte-toi à ton compte' : 'Crée ton compte gratuitement'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded border border-gray-200 p-6 shadow">

          {/* Toggle login / register */}
          <div className="flex border border-gray-200 rounded mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium ${
                mode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom (register seulement) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Prénom et nom</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ton prénom et nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-black"
                  required
                  minLength={2}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="ton@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-black"
                required
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="flex">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe (6 caractères min)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500 bg-white text-black"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 border border-l-0 border-gray-300 rounded-r text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? 'Cacher' : 'Voir'}
                </button>
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {submitLabel}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-gray-500 mt-4">
            {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
            {' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-blue-600 font-medium hover:underline"
            >
              {mode === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
